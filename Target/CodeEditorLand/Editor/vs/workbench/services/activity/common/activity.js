import{createDecorator as o}from"../../../../platform/instantiation/common/instantiation.js";const l=o("activityService");class r{constructor(i){this.descriptorFn=i;this.descriptorFn=i}getDescription(){return this.descriptorFn(null)}}class m extends r{constructor(n,e){super(e);this.number=n;this.number=n}getDescription(){return this.descriptorFn(this.number)}}class A extends r{constructor(n,e){super(e);this.icon=n}}class u extends r{}export{l as IActivityService,A as IconBadge,m as NumberBadge,u as ProgressBadge};
