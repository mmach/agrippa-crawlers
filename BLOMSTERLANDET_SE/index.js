

let BLOMSTERLANDET_SE = (obj, arrayProduct, arrayProductGroups, channel, resolve, reject) => {
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
                // console.log(res.body)
                let productsList = $('[itemtype="http://schema.org/Product"]')
                //     console.log(productsList);
                Object.keys(productsList).filter(item => {
                    return isNaN(item) == false
                }).map(item => {

                    let product = productsList[item];
                    let name_lng = product.children[0].attribs.content;
                    let id = product.children[1].attribs.content;
                    let image = product.children[2].children[0].children[0].attribs.content;
                   
                    let name = product.children[3].children[0].children[0].children[0].children[0].data;

                    // let href = 'https://www.blomsterlandet.se'+ product.children[3].children[0].children[0].children[0].attribs.href;
                    let subgroup = undefined;
                    try {
                        subgroup = product.children[3].children[0].children[1].children[0].data;
                    } catch (err) { }
                    let href = product.children[4].children[0].attribs.content;
                    let price = product.children[4].children[1].attribs.content;
                    let currency = product.children[4].children[2].attribs.content;
                    let status = product.children[4].children[3].attribs.content;
                    let prom = product.children[2].children[0].children[1].attribs["aria-label"];
                    /*
                                        console.log(subgroup);
                                        console.log(id)
                                        console.log(image)
                                        console.log(href)
                                        console.log(currency)
                                        console.log(price)
                                        console.log(prom)*/


                    let prod = {
                        source: 'BLOMSTERLANDET.SE',
                        external_id: id,
                        group: obj.title,
                        link: href,
                        product: name,
                        price: price,
                        currency: currency,
                        prom: prom,
                        status: status,
                        subgroup: subgroup,
                        name_lng: name_lng,
                        image: image

                    }
                    arrayProduct.push(prod)
                })
                //console.log(obj.href)
                //console.log(nextPage);



                resolve();
                done()

            }




        }
    })


}
module.exports = BLOMSTERLANDET_SE 