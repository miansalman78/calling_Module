import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider
import PushKit
import CallKit

@main
class AppDelegate: UIResponder, UIApplicationDelegate, PKPushRegistryDelegate {
  var window: UIWindow?
  var voipRegistry: PKPushRegistry?

  var reactNativeDelegate: ReactNativeDelegate?
  var reactNativeFactory: RCTReactNativeFactory?

  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    let delegate = ReactNativeDelegate()
    let factory = RCTReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()

    reactNativeDelegate = delegate
    reactNativeFactory = factory

    window = UIWindow(frame: UIScreen.main.bounds)

    factory.startReactNative(
      withModuleName: "videocalling",
      in: window,
      launchOptions: launchOptions
    )

    // Initialize VoIP push registry
    voipRegistry = PKPushRegistry(queue: DispatchQueue.main)
    voipRegistry?.delegate = self
    voipRegistry?.desiredPushTypes = [.voIP]

    return true
  }

  // MARK: - PKPushRegistryDelegate

  func pushRegistry(_ registry: PKPushRegistry, didUpdate pushCredentials: PKPushCredentials, for type: PKPushType) {
    let token = pushCredentials.token.map { String(format: "%02.2hhx", $0) }.joined()
    // Send token to React Native module
    NotificationCenter.default.post(
      name: NSNotification.Name("VoIPPushTokenReceived"),
      object: nil,
      userInfo: ["token": token]
    )
  }

  func pushRegistry(_ registry: PKPushRegistry, didReceiveIncomingPushWith payload: PKPushPayload, for type: PKPushType, completion: @escaping () -> Void) {
    // Handle incoming VoIP push
    let userInfo = payload.dictionaryPayload
    NotificationCenter.default.post(
      name: NSNotification.Name("VoIPPushReceived"),
      object: nil,
      userInfo: userInfo
    )
    completion()
  }
}

class ReactNativeDelegate: RCTDefaultReactNativeFactoryDelegate {
  override func sourceURL(for bridge: RCTBridge) -> URL? {
    self.bundleURL()
  }

  override func bundleURL() -> URL? {
#if DEBUG
    RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
#else
    Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }
}
