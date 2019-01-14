import {
  observable,
  action
} from 'mobx'

import { Platform } from 'react-native';

import {
  getComments,
  postComment,
  updateComment,
  deleteComment,
  getCommentsReply,
  postReplyComment,
  updateReplyComment,
  deleteReplyComment
} from './CommentsService';

import Comment from './Comment';
import CommentModel from './CommentModel';
import socket from '../common/services/socket.service';
import session from '../common/services/session.service';
import AttachmentStore from '../common/stores/AttachmentStore';
import attachmentService from '../common/services/attachment.service';
import {toggleExplicit} from '../newsfeed/NewsfeedService';
import RichEmbedStore from '../common/stores/RichEmbedStore';

/**
 * Comments Store
 */
export default class CommentsStore {

  @observable comments = [];
  @observable refreshing = false;
  @observable loaded = false;
  @observable saving = false;
  @observable text = '';
  @observable loading = false;

  // attachment store
  attachment = new AttachmentStore();
  // embed store
  embed = new RichEmbedStore();

  guid = '';
  reversed = true;
  loadNext = '';
  loadPrevious = '';
  socketRoomName = '';

  // parent for reply
  parent = null;

  /**
   * Load Comments
   */
  @action
  async loadComments(guid, limit = 12) {
    if (this.cantLoadMore(guid)) {
      return;
    }
    this.guid = guid;

    this.loading = true;

    let response;

    try {
      if (this.parent) {
        response = await getCommentsReply(this.guid, this.parent._guid, this.reversed, this.loadPrevious, limit);
      } else {
        response = await getComments(this.guid, this.reversed, this.loadPrevious, limit);
      }
      response.comments = CommentModel.createMany(response.comments);
      this.loaded = true;
      this.setComments(response);
      this.checkListen(response);
    } catch (err) {
      console.log('error', err);
    } finally {
      this.loading = false;
    }
  }

  /**
   * Check for socketRoomName and start listen
   * @param {object} response
   */
  checkListen(response) {
    if (!this.socketRoomName && response.socketRoomName) {
      this.socketRoomName = response.socketRoomName;
      this.listen();
    }
  }

  /**
   * Listen for socket
   */
  listen() {
    socket.join(this.socketRoomName);
    socket.subscribe('comment', this.comment);
  }
  /**
   * Stop listen for socket
   */
  unlisten() {
    socket.leave(this.socketRoomName);
    socket.unsubscribe('comment', this.comment);
  }

  /**
   * socket comment message
   */
  comment = (parent_guid, owner_guid, guid, more) => {
    if (owner_guid === session.guid) {
      return;
    }

    this.loadNext = guid;
    this.loadComments(this.guid, 1);
  }

  /**
   * Set comment text
   * @param {string} text
   */
  @action
  setText(text) {
    this.text = text;
    this.embed.richEmbedCheck(text);
  }

  /**
   * Set comments array from response
   * @param {response} response
   */
  @action
  setComments(response) {
    if (response.comments) {
      let comments = this.comments;
      this.comments = [];
      this.comments = response.comments.concat(CommentModel.createMany(comments));

      if (response.comments.length < 11) { //nothing more to load
        response['load-previous'] = '';
      }
    }
    this.reversed = response.reversed;
    this.loadNext = response['load-next'];
    this.loadPrevious = response['load-previous'];
  }

  /**
   * Add a comment
   * @param {object} comment
   */
  @action
  setComment(comment) {
    this.comments.push(CommentModel.create(comment));
  }

  /**
   * Post comment
   */
  async post() {
    this.saving = true;

    const comment = {
      comment: this.text
    }

    if (this.attachment.guid) {
      comment.attachment_guid = this.attachment.guid;
    }

    if (this.embed.meta) {
      Object.assign(comment, this.embed.meta);
    }

    let data;

    try {
      if (this.parent) {
        data = await postReplyComment(this.guid, this.parent._guid, comment);
      } else {
        data = await postComment(this.guid, comment);
      }
      this.setComment(data.comment);
      this.setText('');
      this.embed.clearRichEmbedAction();
      this.attachment.clear();
    } catch (err) {
      console.log(err);
      alert('Error sending comment');
    } finally {
      this.saving = false;
    }
  }

  /**
   * Clear comments
   */
  @action
  clearComments() {
    this.comments = [];
    this.reversed = true;
    this.loadNext = '';
    this.loadPrevious = '';
    this.socketRoomName = '';
    this.loaded = false;
    this.loading = false;
    this.saving = false;
    this.text = '';
  }

  /**
   * Refresh
   */
  @action
  refresh(guid) {
    this.refreshing = true;
    this.clearComments();
  }

  /**
   * Refresh done
   */
  @action
  refreshDone() {
    this.refreshing = false;
  }


  /**
   * Update comment
   * @param {objecft} comment
   * @param {string} description
   */
  @action
  async updateComment(comment, description) {
    this.saving = true;

    try {
      if (this.parent) {
        await updateReplyComment(comment.guid, this.parent._guid, description);
      } else {
        await updateComment(comment.guid, description);
      }

      this.setCommentDescription(comment, description);
    } catch (err) {
      console.log('error', err);
    } finally {
      this.saving = false;
    }



  }

  /**
   * Set comment description
   * @param {object} comment
   * @param {string} description
   */
  @action
  setCommentDescription(comment, description) {
    comment.description = description;
  }

  /**
   * Cant load more
   * @param {string} guid
   */
  cantLoadMore(guid) {
    return this.loaded && !(this.loadPrevious) && !this.refreshing && this.guid === guid;
  }

  /**
   * Reset
   */
  @action
  reset() {
    this.comments = [];
    this.parent = null;
    this.refreshing = false;
    this.loaded = false;
    this.saving = false;
    this.guid = '';
    this.reversed = true;
    this.loadNext = '';
    this.loadPrevious = '';
    this.socketRoomName = '';
  }

  /**
   * Set parent comment
   * @param {object} parent
   */
  setParent(parent) {
    this.parent = parent;
  }

  /**
   * Delete attachment
   */
  async deleteAttachment() {
    const attachment = this.attachment;
    // delete
    const result = await attachment.delete();

    if (result === false) alert('caught error deleting the file');
  }

  /**
   * Attach a video
   */
  async video() {
    try {
      const response = await attachmentService.video();
      if (response) this.onAttachedMedia(response);
    } catch (e) {
      console.error(e);
      alert(e);
    }
  }

  /**
   * Attach a photo
   */
  async photo() {
    try {
      const response = await attachmentService.photo();
      if (response) this.onAttachedMedia(response);
    } catch (e) {
      console.error(e);
      alert(e);
    }
  }

  /**
   * On attached media
   */
  onAttachedMedia = async (response) => {
    const attachment = this.attachment;

    try {
      const result = await attachment.attachMedia(response);
    } catch(err) {
      console.error(err);
      alert('caught upload error');
    }
  }

  /**
   * On media type select
   */
  selectMediaType = async (i) => {
    try {
      let response;
      switch (i) {
        case 1:
          response = await attachmentService.gallery('photo');
          break;
        case 2:
          response = await attachmentService.gallery('video');
          break;
      }

      if (response) this.onAttachedMedia(response);
    } catch (e) {
      console.log(e);
      alert(e);
    }
  }

  /**
   * Open gallery
   */
  async gallery(actionSheet) {
    if (Platform.OS == 'ios') {
      try {
        const response = await attachmentService.gallery('mixed');

        // nothing selected
        if (!response) return;

        const result = await this.attachment.attachMedia(response);

        if (result === false) alert('caught upload error');

      } catch (e) {
        console.error(e);
        alert(e);
      }
    } else {
      actionSheet.show()
    }
  }

  /**
   * Comment toggle explicit
   * @param {string} guid
   */
  @action
  commentToggleExplicit(guid) {
    let index = this.comments.findIndex(x => x.guid == guid);
    if(index >= 0) {
      let comment = this.comments[index];
      let value = !comment.mature;
      return toggleExplicit(guid, value)
        .then(action(response => {
          comment.mature = value;
          this.comments[index] = comment;
        }))
        .catch(action(err => {
          comment.mature = !value;
          this.comments[index] = comment;
          console.log('error');
        }));
    }
  }

  /**
   * Delete
   * @param {string} guid
   */
  @action
  async delete(guid) {
    let index = this.comments.findIndex(x => x.guid == guid);
    if(index >= 0) {
      let entity = this.comments[index];

      if (this.parent) {
        const result = await deleteReplyComment(guid);
      } else {
        const result = await deleteComment(guid);
      }

      this.comments.splice(index, 1);
    }
  }

}