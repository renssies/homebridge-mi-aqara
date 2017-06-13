require('./BaseParser');
const inherits = require('util').inherits;

var Accessory, PlatformAccessory, Service, Characteristic, UUIDGen;

DuplexSwitchParser = function(platform) {
    this.init(platform);
    
    Accessory = platform.Accessory;
    PlatformAccessory = platform.PlatformAccessory;
    Service = platform.Service;
    Characteristic = platform.Characteristic;
    UUIDGen = platform.UUIDGen;
}
inherits(DuplexSwitchParser, BaseParser);

DuplexSwitchParser.prototype.parse = function(json, rinfo) {
    this.platform.log.debug(JSON.stringify(json).trim());
    
    var data = JSON.parse(json['data']);
    var state0 = data['channel_0'];
    var state1 = data['channel_1'];
    var voltage = data['voltage'] / 1.0;
    var lowBattery = this.getLowBatteryByVoltage(voltage);
    var batteryLevel = this.getBatteryLevelByVoltage(voltage);

    var deviceSid = json['sid'];
    this.setSwitch1Accessory(deviceSid, state0, lowBattery, batteryLevel);
	this.setSwitch2Accessory(deviceSid, state1, lowBattery, batteryLevel);
}

DuplexSwitchParser.prototype.getUuidsByDeviceSid = function(deviceSid) {
    return [UUIDGen.generate('DuplexSwitch_1' + deviceSid), UUIDGen.generate('DuplexSwitch_2' + deviceSid)];
}

DuplexSwitchParser.prototype.setSwitch1Accessory = function(deviceSid, state0, lowBattery, batteryLevel) {
	var that = this;
	
    var uuid = UUIDGen.generate('DuplexSwitch_1' + deviceSid);
    var accessory = this.platform.getAccessoryByUuid(uuid);
    if(null == accessory) {
        var accessoryName = deviceSid.substring(deviceSid.length - 4) + "_L";
        accessory = new PlatformAccessory(accessoryName, uuid, Accessory.Categories.SWITCH);
        accessory.reachable = true;

        accessory.getService(Service.AccessoryInformation)
            .setCharacteristic(Characteristic.Manufacturer, "Aqara")
            .setCharacteristic(Characteristic.Model, "Duplex Switch")
            .setCharacteristic(Characteristic.SerialNumber, deviceSid);

        accessory.addService(Service.Switch, accessoryName);
        accessory.addService(Service.BatteryService, accessoryName);
        this.platform.api.registerPlatformAccessories("homebridge-mi-aqara", "MiAqaraPlatform", [accessory]);
        accessory.on('identify', function(paired, callback) {
            that.platform.log(accessory.displayName, "Identify!!!");
            callback();
        });
        
        this.platform.accessories.push(accessory);
        this.platform.log.debug("create new accessories - UUID: " + uuid + ", type: Duplex Switch, deviceSid: " + deviceSid);
    }
    var switchService = accessory.getService(Service.Switch);
    var switchCharacteristic = switchService.getCharacteristic(Characteristic.On);
    if(state0 === 'on') {
        switchCharacteristic.updateValue(true);
    } else if(state0 === 'off') {
        switchCharacteristic.updateValue(false);
    } else {
    }
    
    if (switchCharacteristic.listeners('set').length == 0) {
        var that = this;
        switchCharacteristic.on("set", function(value, callback) {
            var key = that.platform.getWriteKeyByDeviceSid(deviceSid);
            var command = '{"cmd":"write","model":"ctrl_neutral2","sid":"' + deviceSid + '","data":"{\\"channel_0\\":\\"' + (value ? 'on' : 'off') + '\\", \\"key\\": \\"' + key + '\\"}"}';
            that.platform.sendCommandByDeviceSid(deviceSid, command);
            
            callback();
        });
    }
    
    if(!isNaN(lowBattery) && !isNaN(batteryLevel)) {
        var batService = accessory.getService(Service.BatteryService);
        var lowBatCharacteristic = batService.getCharacteristic(Characteristic.StatusLowBattery);
        var batLevelCharacteristic = batService.getCharacteristic(Characteristic.BatteryLevel);
        var chargingStateCharacteristic = batService.getCharacteristic(Characteristic.ChargingState);
        lowBatCharacteristic.updateValue(lowBattery);
        batLevelCharacteristic.updateValue(batteryLevel);
        chargingStateCharacteristic.updateValue(true);
    }
}

DuplexSwitchParser.prototype.setSwitch2Accessory = function(deviceSid, state1, lowBattery, batteryLevel) {
	var that = this;
	
    var uuid = UUIDGen.generate('DuplexSwitch_2' + deviceSid);
    var accessory = this.platform.getAccessoryByUuid(uuid);
    if(null == accessory) {
        var accessoryName = deviceSid.substring(deviceSid.length - 4) + "_R";
        accessory = new PlatformAccessory(accessoryName, uuid, Accessory.Categories.SWITCH);
        accessory.reachable = true;

        accessory.getService(Service.AccessoryInformation)
            .setCharacteristic(Characteristic.Manufacturer, "Aqara")
            .setCharacteristic(Characteristic.Model, "Duplex Switch")
            .setCharacteristic(Characteristic.SerialNumber, deviceSid);

        accessory.addService(Service.Switch, accessoryName);
        accessory.addService(Service.BatteryService, accessoryName);
        this.platform.api.registerPlatformAccessories("homebridge-mi-aqara", "MiAqaraPlatform", [accessory]);
        accessory.on('identify', function(paired, callback) {
            that.platform.log(accessory.displayName, "Identify!!!");
            callback();
        });
        
        this.platform.accessories.push(accessory);
        this.platform.log.debug("create new accessories - UUID: " + uuid + ", type: Duplex Switch, deviceSid: " + deviceSid);
    }
    var switchService = accessory.getService(Service.Switch);
    var switchCharacteristic = switchService.getCharacteristic(Characteristic.On);
    if(state1 === 'on') {
        switchCharacteristic.updateValue(true);
    } else if(state1 === 'off') {
        switchCharacteristic.updateValue(false);
    } else {
    }
    
    if (switchCharacteristic.listeners('set').length == 0) {
        var that = this;
        switchCharacteristic.on("set", function(value, callback) {
            var key = that.platform.getWriteKeyByDeviceSid(deviceSid);
            var command = '{"cmd":"write","model":"ctrl_neutral2","sid":"' + deviceSid + '","data":"{\\"channel_1\\":\\"' + (value ? 'on' : 'off') + '\\", \\"key\\": \\"' + key + '\\"}"}';
            that.platform.sendCommandByDeviceSid(deviceSid, command);
            
            callback();
        });
    }
    
    if(!isNaN(lowBattery) && !isNaN(batteryLevel)) {
        var batService = accessory.getService(Service.BatteryService);
        var lowBatCharacteristic = batService.getCharacteristic(Characteristic.StatusLowBattery);
        var batLevelCharacteristic = batService.getCharacteristic(Characteristic.BatteryLevel);
        var chargingStateCharacteristic = batService.getCharacteristic(Characteristic.ChargingState);
        lowBatCharacteristic.updateValue(lowBattery);
        batLevelCharacteristic.updateValue(batteryLevel);
        chargingStateCharacteristic.updateValue(true);
    }
}
