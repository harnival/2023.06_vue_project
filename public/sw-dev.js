import axios from "axios";

if("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/service-worker.js")
    .then(reg => {
        if(!reg.pushManager.getSubscription()){
            const getPubKey = function(){
                return axios.get('/web-push/public-key')
            }
            const vapid_public_key = getPubKey();
            // 'BBPYVoy_YzpAU84wBsr0gAgSfrgKpK9ufCtzeCpA6BNfM8PaRDz6vZxFDVhQIKzyn59XvO-67G8GUZ2MRkOpkL4'
            const subscribeOption = {
                applicationServerKey : vapid_public_key,
                userVisibleOnly : true
            }
            reg.pushManager.subscribe(subscribeOption)
            .then( res => console.log(res));
        } else {
            console.log('[service worker] subscribe exists - ' +reg.pushManager.getSubscription() )
        }
    })
    

}
//2. 브라우저 알림 허용 체크
if( !("Notification" in window)) {
    alert("알림 지원 안 됨.")
} else if(!Notification.permission || Notification.permission == "default") {
    Notification.requestPermission()
        .then(res => {
            if( res == "granted"){
              const notification = new Notification('notification permitted')
            }
        })
} else if( Notification.permission == "granted") {
    console.log("[notification] permitted.")
} else if( Notification.permission == "denied") {
    console.log("[notification] denied");
}
