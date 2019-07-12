import apiService from "./api.service";
import blockListService from "./block-list.service";
import { first } from "rxjs/operators";
import { BehaviorSubject } from "rxjs";

import _ from 'lodash';

import GroupModel from "../../groups/GroupModel";
import UserModel from "../../channel/UserModel";
import BlogModel from "../../blogs/BlogModel";
import ActivityModel from "../../newsfeed/ActivityModel";
import stores from "../../../AppStores";
import { abort } from "../helpers/abortableFetch";
import entitiesStorage from "./sql/entities.storage";

const CACHE_TTL_MINUTES = 15;

/**
 * Entities services
 */
class EntitiesService {

  /**
   * @var {Map} entities
   */
  entities: Map = new Map();

  /**
   * Contructor
   */
  constructor() {
    setInterval(this.garbageCollector, 60000);
  }

  /**
   * Get one from memory cache
   * @param {string} urn
   * @param {boolean} updateLast
   */
  getFromCache(urn, updateLast = true) {
    const record = this.entities.get(urn)
    if (record && updateLast) record.last = Date.now() / 1000;
    return record ? record.entity : null;
  }

  /**
   * Garbage collector
   */
  garbageCollector = () => {

    const boundary = (Date.now() / 1000) - 60 * CACHE_TTL_MINUTES;

    for (const [key, record] of this.entities.entries()) {
      if (record.last < boundary) {
        this.entities.delete(key);
      }
    }
  }

  /**
   * Get entities from feed
   * @param {Array} feed
   * @param {Mixed} abortTag
   */
  async getFromFeed(feed, abortTag): Promise<EntityObservable[]> {

    if (!feed || !feed.length) {
      return [];
    }

    const blockedGuids = blockListService.blocked;
    let urnsToFetch = [];
    const urnsToResync = [];
    const entities = [];

    for (const feedItem of feed) {
      if (feedItem.entity) {

        // fix entity urn is different than feed urn
        feedItem.entity.urn = feedItem.urn;

        this.addEntity(feedItem.entity);
      } else if (!this.entities.has(feedItem.urn)) {
        urnsToFetch.push(feedItem.urn);
      } else {
        urnsToResync.push(feedItem.urn);
      }
    }

    // if we have urnstoFetch we try to load from the sql storage first
    if (urnsToFetch.length > 0) {
      const localEntities = await entitiesStorage.readMany(urnsToFetch);
      urnsToFetch = _.difference(urnsToFetch, localEntities.map(m => m.urn));
      // we add to resync list
      localEntities.forEach(e => {
        urnsToResync.push(e.urn);
        this.addEntity(e, false)
      });
    }

    // Fetch entities we don't have

    if (urnsToFetch.length) {
      await this.fetch(urnsToFetch, abortTag);
    }

    // Fetch entities, asynchronously, with no need to wait

    if (urnsToResync.length) {
      this.fetch(urnsToResync, abortTag);
    }

    for (const feedItem of feed) {
      if (!blockListService.has(feedItem.owner_guid)) {
        const entity = this.getFromCache(feedItem.urn, false)
        if (entity) {
          entities.push(entity);
        } else {
          console.log('ENTITY MISSINNG ' + feedItem.urn )
        }
      }
    }

    return entities;
  }

  /**
   * Return and fetch a single entity via a urn
   * @param {string} urn
   * @param {BaseModel} defaultEntity
   * @return Object
   */
  async single(urn: string, defaultEntity): EntityObservable {
    if (!urn.startsWith('urn:')) { // not a urn, so treat as a guid
      urn = `urn:activity:${urn}`; // and assume activity
    }

    // from memory
    let entity = this.getFromCache(urn);

    if (!entity) {


      // from sql storage
      const stored = await entitiesStorage.read(urn);

      if (stored) {
        this.addEntity(stored, false);
        entity = this.getFromCache(urn, false);
      } else {
        if (defaultEntity) {
          // if there not exist in memory or sql we use the default entity and we update it later
          this.entities.set(urn, {entity: defaultEntity, last: Date.now() / 1000});
          entity = defaultEntity;
        } else {
          // we fetch from the server
          await this.fetch([urn]);
          entity = this.getFromCache(urn, false);
        }
      }
    }

    if (entity) this.fetch([ urn ]); // Update in the background

    return entity;
  }

  /**
   * Fetch entities
   * @param urns string[]
   * @return []
   */
  async fetch(urns: string[], abortTag: any): Promise<Array<Object>> {

    try {
      const response: any = await apiService.get('api/v2/entities/', { urns }, abortTag);

      for (const entity of response.entities) {
        this.addEntity(entity);
      }

      return response;
    } catch (err) {
      console.log(err)
      throw err;
    }
  }

  /**
   * Add or resync an entity
   * @param {Object} entity
   * @param {boolean} store
   * @return void
   */
  addEntity(entity, store = true): void {
    const storedEntity = this.getFromCache(entity.urn);
    if (storedEntity) {
      storedEntity.update(entity);
    } else {
      this.entities.set(entity.urn, {entity: this.mapToModel(entity), last: Date.now() / 1000});
    }
    if (store) entitiesStorage.save(entity)
  }

  /**
   * Map object to model
   * @param {Object} entity
   */
  mapToModel(entity) {
    switch (entity.type) {
      case 'activity':
        return ActivityModel.create(entity)
      case 'user':
        return UserModel.create(entity);
      case 'group':
        return GroupModel.create(entity)
      case 'object':
        switch (entity.subtype) {
          case 'blog':
            return BlogModel.create(entity);
          case 'image':
          case 'video':
            return ActivityModel.create(entity);
        }
    }
  }
}

export default new EntitiesService();