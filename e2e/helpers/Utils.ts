/**
 * Get the time difference in seconds
 */
export function timeDifference(string: string, start: number, end: number) {
  const elapsed = (end - start) / 1000;
  console.log(`${string} It took ${elapsed} seconds.`);
}

/**
 * Create a cross platform solution for opening a deep link
 */
export async function openDeepLinkUrl(url: string) {
  const prefix = 'wdio://';

  if (driver.isAndroid) {
    // Life is so much easier
    return driver.execute('mobile:deepLink', {
      url: `${prefix}${url}`,
      package: 'com.wdiodemoapp',
    });
  }

  // We can use `driver.url` on iOS simulators, but not on iOS real devices. The reason is that iOS real devices
  // open Siri when you call `driver.url('')` to use a deep link. This means that real devices need to have a different implementation
  // then iOS sims
  // iOS sims and real devices can be distinguished by their UDID. Based on these sources there is a diff in the UDIDS
  // - https://blog.diawi.com/2018/10/15/2018-apple-devices-and-their-new-udid-format/
  // - https://www.theiphonewiki.com/wiki/UDID
  // iOS sims have more than 1 `-` in the UDID and the UDID is being
  const simulatorRegex = new RegExp('(.*-.*){2,}');

  // Check if we are a simulator
  if (
    'udid' in driver.capabilities &&
    simulatorRegex.test(driver.capabilities.udid as unknown as string)
  ) {
    await driver.url(`${prefix}${url}`);
  } else {
    // Else we are a real device and we need to take some extra steps
    // Launch Safari to open the deep link
    await driver.execute('mobile: launchApp', {
      bundleId: 'com.apple.mobilesafari',
    });

    // Add the deep link url in Safari in the `URL`-field
    // This can be 2 different elements, or the button, or the text field
    // Use the predicate string because  the accessibility label will return 2 different types
    // of elements making it flaky to use. With predicate string we can be more precise
    const addressBarSelector = 'label == "Address" OR name == "URL"';
    const urlFieldSelector =
      'type == "XCUIElementTypeTextField" && name CONTAINS "URL"';
    const addressBar = $(`-ios predicate string:${addressBarSelector}`);
    const urlField = $(`-ios predicate string:${urlFieldSelector}`);

    // Wait for the url button to appear and click on it so the text field will appear
    // iOS 13 now has the keyboard open by default because the URL field has focus when opening the Safari browser
    if (!(await driver.isKeyboardShown())) {
      await addressBar.waitForDisplayed();
      await addressBar.click();
    }

    // Submit the url and add a break
    await urlField.setValue(`${prefix}${url}\uE007`);
  }

  /**
   * PRO TIP:
   * if you started the iOS device with `autoAcceptAlerts:true` in the capabilities then Appium will auto accept the alert that should
   * be shown now. You can then comment out the code below
   */
  // Wait for the notification and accept it
  // When using an iOS simulator you will only get the pop-up once, all the other times it won't be shown
  try {
    const openSelector =
      "type == 'XCUIElementTypeButton' && name CONTAINS 'Open'";
    const openButton = $(`-ios predicate string:${openSelector}`);
    // Assumption is made that the alert will be seen within 2 seconds, if not it did not appear
    await openButton.waitForDisplayed({ timeout: 2000 });
    await openButton.click();
  } catch (e) {
    // ignore
  }
}

export function selectElement(
  type: 'id' | 'text',
  text: string,
  wild?: boolean,
) {
  if (!browser.isAndroid) {
    switch (type) {
      case 'id':
        return $(`~${text}`);
      case 'text':
        if (wild) {
          // we check whether the name of the element contains our text and its length is less than text.length + 4.
          // we do the length check with + 4 because sometimes icons are represented in the accessibility name or label
          // of the element with a special character which can sometimes have a length of 2.
          // this is not perfect and sometimes the element may contain more than 2 icons for example. Then
          // this part of the predicate will need to be changed
          const namePredicate = `name CONTAINS[c] '${text}' && name.length <= ${
            text.length + 4
          }`;
          const labelPredicate = `label CONTAINS[c] '${text}' && label.length <= ${
            text.length + 4
          }`;
          return $(
            `-ios predicate string:(type == 'XCUIElementTypeOther' OR type == 'XCUIElementTypeStaticText') && ((${namePredicate}) || (${labelPredicate}))`,
          );
        }
        return $(`~${text}`);
    }
  }

  switch (type) {
    case 'id':
      return $(`android=new UiSelector().resourceId("${text}")`);
    case 'text':
      return $(
        `android=new UiSelector().text("${text}").className("android.widget.TextView")`,
      );
  }
}
