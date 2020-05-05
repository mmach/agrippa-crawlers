

let EUROPRIS = (obj, arrayProduct, arrayProductGroups, channel, resolve, reject) => {
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
                var $ = res.$;
                //   console.log(res.body)
                let nextPage = $('.action.next')
                let numberOfProduts = $('.product.product-item-photo')
                Object.keys(numberOfProduts).filter(item => {
                    return isNaN(item) == false
                }).map(item => {

                    let product = numberOfProduts[item];
                    let price = null;
                    let currency = null


                    let prod = {
                        source: 'EUROPRIS',
                        external_id: product.attribs["data-id"],
                        group: product.attribs["data-category"],
                        link: product.attribs.href,
                        product: product.attribs["data-name"],
                        price: product.attribs["data-price"],
                        currency: 'NOK'

                    }
                    arrayProduct.push(prod)
                })
                //console.log(obj.href)
                //console.log(nextPage);
                Object.keys(nextPage).filter(item => {
                    return isNaN(item) == false
                }).map(item => {
                    let a = nextPage[item];
                    arrayProductGroups.push({
                        source: 'EUROPRIS',
                        href: a.attribs.href,
                        group_img: '',
                        parent: '',
                        title: '',
                        isNextLink: true
                    }
                    )
                });



                resolve();
                done()

            }




        }
    })


}
module.exports = EUROPRIS 