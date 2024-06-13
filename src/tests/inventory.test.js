const RedisPubSubService = require('../services/redisPubSub.service')

class InventoryTest {
    constructor() {
        RedisPubSubService.subscribe('purchase_events', (channel, message) => {

        })
    }

}