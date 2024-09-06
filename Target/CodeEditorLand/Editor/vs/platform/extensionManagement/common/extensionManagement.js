import"../../../../vs/base/common/cancellation.js";import"../../../../vs/base/common/collections.js";import"../../../../vs/base/common/event.js";import"../../../../vs/base/common/paging.js";import{Platform as c}from"../../../../vs/base/common/platform.js";import"../../../../vs/base/common/uri.js";import{localize2 as d}from"../../../../vs/nls.js";import{TargetPlatform as e}from"../../../../vs/platform/extensions/common/extensions.js";import{createDecorator as I}from"../../../../vs/platform/instantiation/common/instantiation.js";const p="^([a-z0-9A-Z][a-z0-9-A-Z]*)\\.([a-z0-9A-Z][a-z0-9-A-Z]*)$",w=new RegExp(p),M="__web_extension",h="skipWalkthrough",F="extensionInstallSource",z="dependecyOrPackExtensionInstall",C="clientTargetPlatform";var x=(a=>(a.COMMAND="command",a.SETTINGS_SYNC="settingsSync",a))(x||{});function K(o){switch(o){case e.WIN32_X64:return"Windows 64 bit";case e.WIN32_ARM64:return"Windows ARM";case e.LINUX_X64:return"Linux 64 bit";case e.LINUX_ARM64:return"Linux ARM 64";case e.LINUX_ARMHF:return"Linux ARM";case e.ALPINE_X64:return"Alpine Linux 64 bit";case e.ALPINE_ARM64:return"Alpine ARM 64";case e.DARWIN_X64:return"Mac";case e.DARWIN_ARM64:return"Mac Silicon";case e.WEB:return"Web";case e.UNIVERSAL:return e.UNIVERSAL;case e.UNKNOWN:return e.UNKNOWN;case e.UNDEFINED:return e.UNDEFINED}}function B(o){switch(o){case e.WIN32_X64:return e.WIN32_X64;case e.WIN32_ARM64:return e.WIN32_ARM64;case e.LINUX_X64:return e.LINUX_X64;case e.LINUX_ARM64:return e.LINUX_ARM64;case e.LINUX_ARMHF:return e.LINUX_ARMHF;case e.ALPINE_X64:return e.ALPINE_X64;case e.ALPINE_ARM64:return e.ALPINE_ARM64;case e.DARWIN_X64:return e.DARWIN_X64;case e.DARWIN_ARM64:return e.DARWIN_ARM64;case e.WEB:return e.WEB;case e.UNIVERSAL:return e.UNIVERSAL;default:return e.UNKNOWN}}function H(o,i){switch(o){case c.Windows:return i==="x64"?e.WIN32_X64:i==="arm64"?e.WIN32_ARM64:e.UNKNOWN;case c.Linux:return i==="x64"?e.LINUX_X64:i==="arm64"?e.LINUX_ARM64:i==="arm"?e.LINUX_ARMHF:e.UNKNOWN;case"alpine":return i==="x64"?e.ALPINE_X64:i==="arm64"?e.ALPINE_ARM64:e.UNKNOWN;case c.Mac:return i==="x64"?e.DARWIN_X64:i==="arm64"?e.DARWIN_ARM64:e.UNKNOWN;case c.Web:return e.WEB}}function u(o,i){return i===e.WEB&&!o.includes(e.WEB)}function Z(o,i,a){return u(i,a)?!1:o===e.UNDEFINED||o===e.UNIVERSAL?!0:o===e.UNKNOWN?!1:o===a}function q(o){return o&&typeof o=="object"&&typeof o.id=="string"&&(!o.uuid||typeof o.uuid=="string")}var f=(t=>(t[t.NoneOrRelevance=0]="NoneOrRelevance",t[t.LastUpdatedDate=1]="LastUpdatedDate",t[t.Title=2]="Title",t[t.PublisherName=3]="PublisherName",t[t.InstallCount=4]="InstallCount",t[t.PublishedDate=10]="PublishedDate",t[t.AverageRating=6]="AverageRating",t[t.WeightedRating=12]="WeightedRating",t))(f||{}),E=(r=>(r[r.Default=0]="Default",r[r.Ascending=1]="Ascending",r[r.Descending=2]="Descending",r))(E||{}),y=(a=>(a.Install="install",a.Uninstall="uninstall",a))(y||{}),g=(s=>(s[s.None=1]="None",s[s.Install=2]="Install",s[s.Update=3]="Update",s[s.Migrate=4]="Migrate",s))(g||{});const Q=I("extensionGalleryService");var m=(l=>(l.Timeout="Timeout",l.Cancelled="Cancelled",l.Failed="Failed",l.DownloadFailedWriting="DownloadFailedWriting",l.Offline="Offline",l))(m||{});class j extends Error{constructor(a,r){super(a);this.code=r;this.name=r}}var P=(n=>(n.Unsupported="Unsupported",n.Deprecated="Deprecated",n.Malicious="Malicious",n.Incompatible="Incompatible",n.IncompatibleApi="IncompatibleApi",n.IncompatibleTargetPlatform="IncompatibleTargetPlatform",n.ReleaseVersionNotFound="ReleaseVersionNotFound",n.Invalid="Invalid",n.Download="Download",n.DownloadSignature="DownloadSignature",n.DownloadFailedWriting="DownloadFailedWriting",n.UpdateMetadata="UpdateMetadata",n.Extract="Extract",n.Scanning="Scanning",n.ScanningExtension="ScanningExtension",n.ReadUninstalled="ReadUninstalled",n.UnsetUninstalled="UnsetUninstalled",n.Delete="Delete",n.Rename="Rename",n.IntializeDefaultProfile="IntializeDefaultProfile",n.AddToProfile="AddToProfile",n.InstalledExtensionNotFound="InstalledExtensionNotFound",n.PostInstall="PostInstall",n.CorruptZip="CorruptZip",n.IncompleteZip="IncompleteZip",n.Signature="Signature",n.NotAllowed="NotAllowed",n.Gallery="Gallery",n.Cancelled="Cancelled",n.Unknown="Unknown",n.Internal="Internal",n))(P||{});class Y extends Error{constructor(a,r){super(a);this.code=r;this.name=r}}const $=I("extensionManagementService"),J="extensionsIdentifiers/disabled",ee="extensionsIdentifiers/enabled",ne=I("IGlobalExtensionEnablementService"),oe=I("IExtensionTipsService"),te=d("extensions","Extensions"),ie=d("preferences","Preferences");export{J as DISABLED_EXTENSIONS_STORAGE_PATH,ee as ENABLED_EXTENSIONS_STORAGE_PATH,p as EXTENSION_IDENTIFIER_PATTERN,w as EXTENSION_IDENTIFIER_REGEX,C as EXTENSION_INSTALL_CLIENT_TARGET_PLATFORM_CONTEXT,z as EXTENSION_INSTALL_DEP_PACK_CONTEXT,h as EXTENSION_INSTALL_SKIP_WALKTHROUGH_CONTEXT,F as EXTENSION_INSTALL_SOURCE_CONTEXT,j as ExtensionGalleryError,m as ExtensionGalleryErrorCode,x as ExtensionInstallSource,Y as ExtensionManagementError,P as ExtensionManagementErrorCode,te as ExtensionsLocalizedLabel,Q as IExtensionGalleryService,$ as IExtensionManagementService,oe as IExtensionTipsService,ne as IGlobalExtensionEnablementService,g as InstallOperation,ie as PreferencesLocalizedLabel,f as SortBy,E as SortOrder,y as StatisticType,K as TargetPlatformToString,M as WEB_EXTENSION_TAG,H as getTargetPlatform,q as isIExtensionIdentifier,u as isNotWebExtensionInWebTargetPlatform,Z as isTargetPlatformCompatible,B as toTargetPlatform};
