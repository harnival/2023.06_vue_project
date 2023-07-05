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

self.addEventListener('fetch',function(e){
    e.respondWith(
        cache.match(e.request)
        .then(res => {
            if(res){ return res}
            const q = e.request.clone();    // catch the response
            fetch(q).then(res => {
                if(!res || res.status != 200 || res.type != 'basic') {return res}
                const w = res.clone();
                caches.open(cacheName)
                .then(cache => {
                    cache.put(e.request,w)
                });
                return res
            })
        })
    )
})