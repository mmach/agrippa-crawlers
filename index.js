var amqp = require('amqplib/callback_api');
var Crawler = require("crawler");
const redis = require('async-redis');
var Promise = require('bluebird');
var HAGELAND_NO = require('./HAGELAND_NO/index.js');
var BLOMSTERLANDET_SE = require('./BLOMSTERLANDET_SE/index.js');
var IKEA = require('./IKEA/index.js');

const CONN_URL = process.env.AMQP ? process.env.AMQP : 'amqp://oqxnmzzs:hUxy1BVED5mg9xWl8lvoxw3VAmKBOn7O@squid.rmq.cloudamqp.com/oqxnmzzs';
const PREFETCH = process.env.PREFETCH ? process.env.PREFETCH : 5;
const MAX_CONNECTIONS = process.env.MAX_CONNECTIONS ? process.env.MAX_CONNECTIONS : 10;

global.c = new Crawler({
    maxConnections: MAX_CONNECTIONS,
    retries: 30,
    retryTimeout: 60000,

});



// Queue just one URL, with default callback


// Queue some HTML code directly without grabbing (mostly for tests)
amqp.connect(CONN_URL, async function (error0, connection) {
    if (error0) {
        console.log(error0)
        throw error0;
    }

    connection.createChannel(function (error1, channel) {

        if (error1) {
            throw error1;
        }

        var queue = 'products-queue';

        channel.prefetch(PREFETCH);

        console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);
        channel.consume(queue, async function (msg) {
            let arrayProductsGroup = []
            let arrayProduct = []
            let obj = msg.content.toString();
            obj = JSON.parse(obj);
            try {
                console.log(obj)

                await new Promise((resolve, reject) => {
                    if (obj.source == 'HAGELAND.NO') {
                        HAGELAND_NO(obj, arrayProduct, arrayProductsGroup, channel, resolve, reject)
                    }
                    if (obj.source == 'BLOMSTERLANDET.SE') {
                        BLOMSTERLANDET_SE(obj, arrayProduct, arrayProductsGroup, channel, resolve, reject)
                    }
                    if (obj.source == 'IKEA') {
                        IKEA(obj, arrayProduct, arrayProductsGroup, channel, resolve, reject)
                    }
                })

                if (obj.isNextLink != true) {
                    await new Promise((resolve, reject) => {
                        amqp.connect(CONN_URL, function (errGroup, connGroup) {
                            if (errGroup) {
                                console.log("CONNECTION ERROR");
                                console.log(errGroup);
                                reject();
                                return;
                            }
                            connGroup.createChannel(async function (err2, channelGroup) {
                                if (err2) {
                                    console.log("CHANEL ERROR");
                                    console.log(err2);
                                    channelGroup.close()
                                    connGroup.close();
                                    reject();
                                    return

                                } chGroup = channelGroup;
                                channelGroup.assertQueue('products-group-queue', {
                                    durable: true
                                });
                                await channelGroup.sendToQueue('products-group-queue', new Buffer(JSON.stringify(obj)), { persistent: true });
                                setTimeout(() => {
                                    channelGroup.close();
                                    connGroup.close();
                                    resolve();

                                    //  ch.close();
                                }, 1000)

                                resolve();

                            });
                        })
                    });
                }

                await new Promise((resolve, reject) => {
                    amqp.connect(CONN_URL, function (errGroup, connGroup) {
                        if (errGroup) {
                            console.log("CONNECTION ERROR");
                            console.log(errGroup);
                            reject();
                            return;
                        }
                        connGroup.createChannel(async function (err2, channelGroup) {
                            if (err2) {
                                console.log("CHANEL ERROR");
                                console.log(err2);
                                channelGroup.close()
                                connGroup.close();
                                reject();
                                return

                            } chGroup = channelGroup;
                            channelGroup.assertQueue('products-queue', {
                                durable: true
                            });

                            let promises = arrayProductsGroup.map(item => {
                                return channelGroup.sendToQueue('products-queue', new Buffer(JSON.stringify(item)), { persistent: true });
                            })

                            await Promise.all(promises)
                            setTimeout(() => {
                                channelGroup.close();
                                connGroup.close();
                                resolve();

                                //  ch.close();
                            }, 1000)

                        });
                    })
                });

                await new Promise((resolve, reject) => {
                    amqp.connect(CONN_URL, function (errItem, connItem) {
                        if (errItem) {
                            console.log("CONNECTION ERROR");
                            console.log(errItem);
                            reject();
                            return;
                        }
                        connItem.createChannel(async function (err2, channelItem) {
                            if (err2) {
                                console.log("CHANEL ERROR");
                                channelItem.close();
                                connItem.close();
                                reject();

                                console.log(err);

                                return

                            } chItem = channelItem;
                            channelItem.assertQueue('product-item-queue', {
                                durable: true
                            });

                            let promises = arrayProduct.map(item => {
                                return chItem.sendToQueue('product-item-queue', new Buffer(JSON.stringify(item)), { persistent: true });
                            })
                            await Promise.all(promises)

                            setTimeout(() => {
                                channelItem.close();
                                connItem.close();
                                resolve();

                                //  ch.close();
                            }, 1000)

                        });
                    })
                });
                console.log(obj)
                channel.ack(msg)
            } catch (err) {
                console.log(err);
                setTimeout(() => {
                    channel.nack(msg)

                }, 60000)

            }

            // console.log(arrayProduct);
            // channel.nack(msg);
            // console.log(" [x] Received %s", msg.content.toString());

        }, {
            noAck: false
        });
    });
});
