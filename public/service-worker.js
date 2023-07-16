const cacheName = "cheezzCache";
const cacheList = ['/',];

self.addEventListener("install",function(e){
    console.log("[service worker] installed");
    const caching = async function(){
        const q = await caches.open(cacheName);
        const w = q.addAll(cacheList);
        return w
    }
    e.waitUntil(caching);
});

self.addEventListener('fetch',function(event){
    event.respondWith(
        caches.open(cacheName)
        .then(function(cache){
            return cache.match(event.request)
                .then(function(res){
                    if (res) { return res}
                    else { return fetch(event.request)}
                })
        })
    )
})

// 알림 설정 //
const notiSet = function(){
    Notification.permission( res => {
        if( res == 'granted'){
            navigator.serviceWorker.ready
            .then(reg => {
                reg.showNotification('title sample',{
                    body: ' notification has already permitted',
                    icon: './img/icons/android-chrome-192x192.png',
                    tag: 'granted'
                })
            })
        }
    })
}
self.addEventListener('push',function(event){
    const {title, body} = event.data.json();
    const options = {
        body,
        icon: './img/icon/favicon-32x32.png',
        badge: './img/icon/favicon-16x16.png'
    }
    event.waitUntil( self.ServiceWorkerRegistration.showNotification(title, options) )
})