const staticCache = 'static-v3';
const assets=[
    '/',
    // '/secrets',
    'https://fonts.googleapis.com/css2?family=Megrim&display=swap',
    'https://fonts.googleapis.com/css2?family=Poppins:wght@300&display=swap',
    'https://fonts.googleapis.com/css2?family=Rubik&family=Ubuntu:wght@500;700&display=swap',
    "https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css",
    "https://code.jquery.com/jquery-3.5.1.slim.min.js",
    "https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js",
    "https://cdn.jsdelivr.net/npm/popper.js@1.16.1/dist/umd/popper.min.js",
    "https://fonts.googleapis.com/css2?family=Baloo+Tamma+2&display=swap",
    "https://fonts.googleapis.com/css2?family=Didact+Gothic&display=swap",
    "https://fonts.gstatic.com/s/rubik/v11/iJWZBXyIfDnIV5PNhY1KTN7Z-Yh-B4iFWkU1Z4Y.woff2",
    "https://fonts.gstatic.com/s/ubuntu/v15/4iCv6KVjbNBYlgoCjC3jtGyNL4U.woff2",
    "https://fonts.gstatic.com/s/poppins/v13/pxiByp8kv8JHgFVrLDz8Z11lFc-K.woff2",
    "https://fonts.gstatic.com/s/megrim/v11/46kulbz5WjvLqJZVam_h.woff2",
    "https://fonts.gstatic.com/s/didactgothic/v14/ahcfv8qz1zt6hCC5G4F_P4ASlUaYpnLl.woff2",
    "https://fonts.gstatic.com/s/balootamma2/v1/vEFX2_hCAgcR46PaajtrYlBbf1U81-qe.woff2",
    "https://fonts.gstatic.com/s/balootamma2/v1/vEFX2_hCAgcR46PaajtrYlBbf0881w.woff2",
    '/JS/animate.js',
    '/css/style.css',
    // '/css/profilestyle.css',
    '/css/style2.css',
    '/css/stylesearch.css',
    '/css/styleregister.css',
    '/imsges/eng.jpg',
    '/imsges/eng2.jpg',
    '/imsges/google.png',
    '/imsges/google2.png',
    '/error.html',
];

self.addEventListener('install', evt => {
    evt.waitUntil(caches.open(staticCache).then(cache => {
        console.log("caching assets");
        cache.addAll(assets);
        })
    );
});

self.addEventListener('activate', evt=>{
    evt.waitUntil(caches.keys().then(keys => {
        return Promise.all(keys.filter(key => key !== staticCache).map(key => caches.delete(key)
        ))
    }))
});
self.addEventListener('fetch' , evt => {
    evt.respondWith(caches.match(evt.request).then(cacheRes =>{
        return cacheRes || fetch(evt.request)
    }).catch(() => caches.match('/error.html'))
    );
});