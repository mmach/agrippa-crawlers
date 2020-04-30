

let IKEA = (obj, arrayProduct, arrayProductGroups, channel, resolve, reject) => {
    global.c.queue({
        uri: obj.href,
        forceUTF8: false,
        headers: {
            "Content-Type": "application/json",
            "sec-fetch-site": "same-origin",
            "sec-fetch-mode": "navigate",
            "sec-fetch-user": "?1",
            "upgrade-insecure-requests": 1,
            "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3"
        },
        callback: function (error, res, done) {
            if (error) {
                console.log("#############ERROR############")
                console.log(error);
                setTimeout(() => {
                    channel.nack(msg);

                    resolve();
                    done();
                }, 60000)
            } else {
                console.log(obj.title)
                JSON.parse(res.body).moreProducts.productWindow.forEach(item => {

                    arrayProduct.push({
                        source: 'IKEA_PREPROCESSED',
                        href: `https://www.ikea.com/ie/en/products/${item.id.slice(item.id.length - 3, item.id.length)}/${item.id}-compact-fragment.html`,
                        category: obj.title
                    }
                    )
                });
                //console.log(obj.href)
                //console.log(nextPage);



                resolve();
                done()

            }




        }
    })


}
module.exports = IKEA 