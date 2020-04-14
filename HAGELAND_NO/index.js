

let HAGELAND_NO = (obj, arrayProduct, arrayProductGroups, channel, resolve, reject) => {
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
                let productsList = $('.product-category.product')
                let nextPage = $('.next.page-numbers')
                let numberOfProduts = $('.product.type-product')
                Object.keys(numberOfProduts).filter(item => {
                    return isNaN(item) == false
                }).map(item => {

                    let product = numberOfProduts[item];
                    let price = null;
                    let currency = null

                    try {
                        price = product.children[1].children[2].children[0].children[0].children[0].children[1].data.trim()
                        currency = product.children[1].children[2].children[0].children[0].children[0].children[0].children[0].data;

                    } catch (err) {

                    }
                    let prod = {
                        source: 'HAGELAND.NO',
                        external_id: product.attribs.class.split(' ').filter(id => { return id.startsWith('post') })[0].split('-')[1],
                        group: obj.title,
                        link: product.children[1].children[1].children[0].attribs.href,
                        product: product.children[1].children[1].children[0].children[0].data,
                        price: price,
                        currency: currency

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
                        source: 'HAGELAND.NO',
                        href: a.attribs.href,
                        group_img: obj.group_img,
                        parent: obj.title,
                        title: obj.title,
                        isNextLink: true
                    }
                    )
                });

                Object.keys(productsList).filter(item => {
                    return isNaN(item) == false
                }).map(item => {
                    let a = productsList[item].children;
                    arrayProductGroups.push({
                        source: 'HAGELAND.NO',
                        title: a[1].children[3].prev.children[0].children[0].data.replace('\n', ''),
                        href: a[1].attribs.href,
                        group_img: a[1].children[0].attribs["data-src"],
                        parent: obj.title
                    }
                    )
                });

                resolve();
                done()

            }




        }
    })


}
module.exports = HAGELAND_NO 