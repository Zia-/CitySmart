import React, {Component} from 'react';
import wwwOSMLayer from './frontend/wwwOSM.js';
//import AutoScale from 'react-auto-scale'; //Might be useful later

class WorldWind extends Component{
    

    shouldComponentUpdate(){
        return false;
    }

    componentDidMount(){

        const WorldWind = window.WorldWind;

        this.globe = new WorldWind.WorldWindow(this.refs.canvasOne.id);

        var OpenStreetMapLayer = new WorldWind.OpenStreetMapImageLayer();
        var BingAerialLayer = new WorldWind.BingAerialLayer();
        var serverAddress = 'http://199.79.36.155/cgi-bin/mapserv?map=WorldWind.map';

        function getXMLDom (globe, serverAddress) { // Asynchronously adding layers from Sprinfield's WMS
            if (!serverAddress) {
                return;
            }

            serverAddress = serverAddress.trim();

            serverAddress = serverAddress.replace("Http", "http");
            if (serverAddress.lastIndexOf("http", 0) != 0) {
                serverAddress = "http://" + serverAddress;
            }

            var thisExplorer = this,
                request = new XMLHttpRequest(),
                url = WorldWind.WmsUrlBuilder.fixGetMapString(serverAddress);

            url += "service=WMS&request=GetCapabilities&vers";

            request.open("GET", url, true);
            request.onreadystatechange = function () {
                if (request.readyState === 4 && request.status === 200) {
                    
                    var xmlDom = request.responseXML;
                    
                    if (!xmlDom && request.responseText.indexOf("<?xml") === 0) {
                        xmlDom = new window.DOMParser().parseFromString(request.responseText, "text/xml");
                        var wmsCapsDoc = new WorldWind.WmsCapabilities(xmlDom);
                        var layerCaps = wmsCapsDoc.capability.layers[0].layers[3];
                        //console.log(layerCaps);
                        var config = WorldWind.WmsLayer.formLayerConfiguration(layerCaps, null);
                        var SpringfieldWmsLayer = {layer: new WorldWind.WmsLayer(config, null), enabled: true};
                        //console.log(SpringfieldWmsLayer);
                        SpringfieldWmsLayer.layer.enabled = SpringfieldWmsLayer.enabled;
                        globe.addLayer(SpringfieldWmsLayer.layer);
                    }
                    if (!xmlDom) {
                        alert(serverAddress + " retrieval failed. It is probably not a WMS server.");
                        return;
                    }
                } 
            };
            request.send(null);
        }

        // Switch default (and defunct) OSM tile server from MapQuest to OpenStreetMap test servers
        OpenStreetMapLayer.urlBuilder = {
            urlForTile: function (tile, imageFormat) {
                    //OSM Tile server only for development purposes, DO NOT use in production.
                    return "http://a.tile.openstreetmap.org/" +
                        (tile.level.levelNumber + 1) + "/" + tile.column + "/" + tile.row + ".png";
            }
        }

        // Render notice of OSM tiles copyright and tile usage policy
        // see: https://operations.osmfoundation.org/policies/tiles/
        var dc = this.globe.drawContext;
        OpenStreetMapLayer.doRender = function(dc){
            WorldWind.MercatorTiledImageLayer.prototype.doRender.call(this, dc);
            if(this.inCurrentFrame){
                dc.screenCreditController.addStringCredit(" ", WorldWind.Color.BLACK);
                dc.screenCreditController.addStringCredit(" ", WorldWind.Color.BLACK);
                dc.screenCreditController.addStringCredit("See: https://operations.osmfoundation.org/policies/tiles/", WorldWind.Color.BLACK);
                dc.screenCreditController.addStringCredit("Do not use OSM Foundation tile servers for production purposes.", WorldWind.Color.BLACK);
                dc.screenCreditController.addStringCredit("OSM tiles by \u00A9OpenStreetMap. ", WorldWind.Color.BLACK);
            }
        
        }
        
        // Create WorldWind's layers
        var layers = [
            {layer: new WorldWind.BMNGOneImageLayer(), enabled: false},
            {layer: new WorldWind.BingRoadsLayer(), enabled: false},
            {layer: BingAerialLayer, enabled: false},
            {layer: OpenStreetMapLayer, enabled: true},
            {layer: new WorldWind.CompassLayer(), enabled: true},
            {layer: new WorldWind.CoordinatesDisplayLayer(this.globe), enabled: true},
            {layer: new WorldWind.ViewControlsLayer(this.globe), enabled: true}
        ];

        // Create layers.
        for (var l = 0; l < layers.length; l++) {
            layers[l].layer.enabled = layers[l].enabled;
            this.globe.addLayer(layers[l].layer);
        }

        // Create Springfield layer from WMS
        getXMLDom(this.globe, serverAddress);

        // Create 3D buildings
        //wwwOSMLayer(this.globe, WorldWind, OpenStreetMapLayer);

        //let {initialCenter, zoom} = this.props;
     }

    render() {
        const style = {
            backgroundColor: '#7887AB',
            //flexDirection: 'column',
            flexGrow: 1
            //height: '500',
            //flex: 1,
            //align: 'center'
        }

        return(
            <canvas id="canvasOne" ref="canvasOne" style={style}>
                Your browser does not support HTML5 Canvas.
            </canvas>
        )
    }
}

WorldWind.propTypes = {
    worldwind: React.PropTypes.object,
    zoom: React.PropTypes.number,
    initialCenter: React.PropTypes.object
}

WorldWind.defaultProps = {
    zoom: 15,
    // Florence by default
    initialCenter: {
        lat: 43.7696,
        lng: 11.2558
    }
}

export default WorldWind;


