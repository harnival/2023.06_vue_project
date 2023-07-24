/* eslint-disable no-console */

import { register } from 'register-service-worker'

if (process.env.NODE_ENV === 'production') {
  register(`${process.env.BASE_URL}service-worker.js`, {
    ready () {
      console.log(
        'App is being served from cache by a service worker.\n' +
        'For more details, visit https://goo.gl/AFskqB'
      )
    },
    registered () {
      console.log('Service worker has been registered.')
    },
    cached () {
      console.log('Content has been cached for offline use.')
    },
    updatefound () {
      console.log('New content is downloading.')
    },
    updated () {
      console.log('New content is available; please refresh.')
    },
    offline () {
      console.log('No internet connection found. App is running in offline mode.')
    },
    error (error) {
      console.error('Error during service worker registration:', error)
    }
  })
}
// -----------------------------------------------------------------

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
            .then( res => console.log("[subscription]" , res));
        } else {
            console.log('[service worker] subscribe exists - ' ,reg.pushManager.getSubscription() )
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

// 
