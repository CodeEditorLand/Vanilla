import{CancellationToken as b}from"../../../../vs/base/common/cancellation.js";import{InstallOperation as h}from"../../../../vs/platform/extensionManagement/common/extensionManagement.js";import{areSameExtensions as d,getExtensionId as c}from"../../../../vs/platform/extensionManagement/common/extensionManagementUtil.js";import"../../../../vs/platform/extensionManagement/common/extensionStorage.js";import{ExtensionType as $}from"../../../../vs/platform/extensions/common/extensions.js";import"../../../../vs/platform/log/common/log.js";async function k(o,u,E,f,i){try{const r=await o.getExtensionsControlManifest();if(!r.deprecated)return;const l=await o.getInstalled($.User);for(const[g,p]of Object.entries(r.deprecated)){if(!p?.extension)continue;const{id:s,autoMigrate:x,preRelease:I}=p.extension;if(!x)continue;const e=l.find(n=>d(n.identifier,{id:g}));if(!e)continue;const m=(await u.getExtensions([{id:s,preRelease:I}],{targetPlatform:await o.getTargetPlatform(),compatible:!0},b.None))[0];if(!m){i.info(`Skipping migrating '${e.identifier.id}' extension because, the comaptible target '${s}' extension is not found`);continue}try{i.info(`Migrating '${e.identifier.id}' extension to '${s}' extension...`);const n=!f.getDisabledExtensions().some(a=>d(a,e.identifier));await o.uninstall(e),i.info(`Uninstalled the unsupported extension '${e.identifier.id}'`);let t=l.find(a=>d(a.identifier,{id:s}));(!t||!t.isPreReleaseVersion&&n)&&(t=await o.installFromGallery(m,{installPreReleaseVersion:!0,isMachineScoped:e.isMachineScoped,operation:h.Migrate}),i.info(`Installed the pre-release extension '${t.identifier.id}'`),n||(await f.disableExtension(t.identifier),i.info(`Disabled the pre-release extension '${t.identifier.id}' because the unsupported extension '${e.identifier.id}' is disabled`)),x.storage&&(E.addToMigrationList(c(e.manifest.publisher,e.manifest.name),c(t.manifest.publisher,t.manifest.name)),i.info("Added pre-release extension to the storage migration list"))),i.info(`Migrated '${e.identifier.id}' extension to '${s}' extension.`)}catch(n){i.error(n)}}}catch(r){i.error(r)}}export{k as migrateUnsupportedExtensions};
