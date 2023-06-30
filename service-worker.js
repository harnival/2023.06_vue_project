const cacheName = "cheezzCache";
const cacheList = [];

self.addEventListener("install",function(e){
    console.log("[service worker] installed");
    const caching = async function(){
        const q = await caches.open(cacheName);
        const w = q.addAll(cacheList);
        return w
    }
    e.waitUntil(caching);
});

