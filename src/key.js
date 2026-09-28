// Labels and fills from Advisory Key.xlsx, Status Key (DRAFT), September 2026.
// Text uses dark ink on lighter fills to retain readable contrast.
export const STATUSES = [
  {id:'not-started', label:'Not Started', color:'#DFE9FC', ink:'#142438', meaning:'Contact not vetted enough to decide whether to pursue membership.'},
  {id:'waiting-for-reply', label:'Waiting for Reply', color:'#FFDA72', ink:'#6B4600', meaning:'Contacted; awaiting a response. Check for outdated contact information.'},
  {id:'ready-for-contact', label:'Ready for Contact', color:'#78B5D5', ink:'#102F43', meaning:'Contact vetted and ready for outreach.'},
  {id:'scheduled', label:'Scheduled', color:'#5995CD', ink:'#102F43', meaning:'Communication date and time confirmed.'},
  {id:'needs-follow-up', label:'Needs Follow Up', color:'#F6AF89', ink:'#5B280F', meaning:'Something needs to be followed up on with this contact.'},
  {id:'needs-immediate-action', label:'Needs Immediate Action', color:'#C00000', ink:'#FFFFFF', meaning:'Membership is in jeopardy or the contact needs immediate follow up.'},
  {id:'very-active', label:'Very Active', color:'#70A642', ink:'#14210A', meaning:'This contact is a leader and very responsive.'},
  {id:'on-hold', label:'On Hold', color:'#A5A5A5', ink:'#202020', meaning:'Membership temporarily paused.'},
  {id:'removed', label:'Removed', color:'#555555', ink:'#FFFFFF', meaning:'Retired or moved on from our board.'}
];
export const AREAS = [
  {id:'event-design', label:'Event Design & Planning', color:'#E79655', ink:'#352013'},
  {id:'event-management', label:'Event Planning & Management', color:'#E9C46A', ink:'#3E3010'},
  {id:'exhibit', label:'Exhibit & Experience Design', color:'#C55A11', ink:'#FFFFFF'},
  {id:'tad', label:'Technology, Art & Design', description:'Formerly Creativity & Innovation', color:'#9DC3E6', ink:'#000000'},
  {id:'graphic', label:'Graphic Design', color:'#2B67AE', ink:'#FFFFFF'},
  {id:'fine-art', label:'BFA Fine Art', color:'#00B0F0', ink:'#172630'},
  {id:'interactive', label:'Interactive Multimedia Design', color:'#385724', ink:'#FFFFFF'},
  {id:'computer-science', label:'Computer Science & Design', color:'#00B050', ink:'#082B18'},
  {id:'illustration-animation', label:'Digital Illustration & Animation', color:'#7654A6', ink:'#FFFFFF'},
  {id:'art-education', label:'Visual Arts Education', color:'#A34165', ink:'#FFFFFF'}
];
export const CONNECTIONS = [
  {id:'board',label:'Board member / past board service'},
  {id:'applicant',label:'Interested in joining the board'},
  {id:'supporter',label:'Stay connected / receive updates'},
  {id:'faculty',label:'TAD faculty'}
];
export const SITE_PHOTOS = [
  {url:'assets/cover-exhibit.jpg',alt:'Two people together at an exhibit industry event'},
  {url:'assets/portfolio-review.jpg',alt:'A TAD portfolio review'},
  {url:'assets/portfolio-review-conversation.jpg',alt:'A conversation during portfolio review'},
  {url:'assets/student-presentation.jpg',alt:'A student presenting work to a panel'},
  {url:'assets/exhibit-conversation.jpg',alt:'A conversation at an exhibit event'}
];
export const areaName = id => AREAS.find(a=>a.id===id)?.label || id;
export const statusFor = id => STATUSES.find(s=>s.id===id) || STATUSES[0];
export const connectionName = id => CONNECTIONS.find(c=>c.id===id)?.label || id;
