rivets.components['permission-app'] = {
    template: function(){
        return '\
            <div class="permission-app">\
                <permission-tabs></permission-tabs>\
                <permission-tabs-content permissions="permissions" useroptions="useroptions"></permission-tabs-content>\
            </div>\
            ';
    },
    initialize: function(el, data){
        return new permissionAppController( data );
    }
}
function permissionAppController( data ){
    this.permissions = data.permissions;
    this.useroptions = data.useroptions;
};

rivets.components['permission-tabs'] = {
    template: function(){
        return '\
            <div class="tab_header tab-menu tab-menu-user-permissions">\
                <permission-tab name="Campaigns" tab-id="campaigns" active="true"></permission-tab>\
                <permission-tab name="Landings" tab-id="landings" ></permission-tab>\
                <permission-tab name="Offers" tab-id="offers" ></permission-tab>\
                <permission-tab name="Rotations" tab-id="rotations"></permission-tab>\
                <permission-tab name="Aff. Networks" tab-id="affiliate-networks"></permission-tab>\
                <permission-tab name="Traffic Sources" tab-id="traffic-sources"></permission-tab>\
                <permission-tab name="Domains" tab-id="domains"></permission-tab>\
            </div>\
        ';
    },
    initialize: function(el, data){
        return new permissionTabsController( data );
    }
}
function permissionTabsController( data ){};

rivets.components['permission-tab'] = {
    static: ['name', 'tabId', 'active'],
    template: function(){
        return '<div rv-data-tab-name="tabId" class="tab-button" rv-class-tab-button-active="active" rv-text="name" ></div>';
    },
    initialize: function(el, data){
        return new permissionTabController( data );
    }
}
function permissionTabController( data ){ 
    this.name = data.name;
    this.tabId = data.tabId;
    this.active = data.active;
};

rivets.components['permission-tabs-content'] = {
    template: function(){
        return '\
            <div class="tab-content-wrapper tab-content-wrapper-user-permissions" >\
                <permission-tab-content perm-list="permissions.campaigns" useroptions="useroptions" options-type="campaigns" tab-id="campaigns"  title="Campaigns" active="true"></permission-tab-content>\
                <permission-tab-content perm-list="permissions.landers" useroptions="useroptions" options-type="landers" tab-id="landings" title="Landings" ></permission-tab-content>\
                <permission-tab-content perm-list="permissions.offers" useroptions="useroptions" options-type="offers" tab-id="offers" title="Offers" ></permission-tab-content>\
                <permission-tab-content perm-list="permissions.rotations" useroptions="useroptions" options-type="rotations" tab-id="rotations" title="Rotations" ></permission-tab-content>\
                <permission-tab-content perm-list="permissions.networks" useroptions="useroptions" options-type="networks" tab-id="affiliate-networks" title="Affiliate Networks" ></permission-tab-content>\
                <permission-tab-content perm-list="permissions.sources" useroptions="useroptions" options-type="sources" tab-id="traffic-sources" title="Traffic Sources" show-facebook="true"></permission-tab-content>\
                <permission-tab-content perm-list="permissions.domains" useroptions="useroptions" options-type="domains" tab-id="domains" title="Domains" ></permission-tab-content>\
            </div>\
            ';
    },
    initialize: function(el, data){
        return new permissionTabsContentController( data );
    }
}
function permissionTabsContentController( data ){
    this.permissions = data.permissions;
    this.useroptions = data.useroptions;
};

rivets.components['permission-tab-content'] = {
    static: ['tabId', 'title', 'active', 'optionsType'],
    template: function(){
        return '\
                <div rv-data-tab-name="tabId" class="tab-content-block" rv-class-tab-content-block-active="active">\
                    <elements-list-checkboxes parent-param="childParam" useroptions="useroptions" options-type="optionsType" ></elements-list-checkboxes>\
                    <elements-list rv-unless="childParam.allChecked" options-type="optionsType" elements="permList.elements" groups="permList.groups" parent-param="childParam" ></elements-list>\
                    <element-all rv-if="childParam.allChecked" useroptions="useroptions" options-type="optionsType" ></element-all>\
                    <elements-list-buttons elements="permList.elements" groups="permList.groups" block-type="title" options-type="optionsType" parent-param="childParam" ></elements-list-buttons>\
                    <div rv-if="showFacebook" id="vue-permissions"></div>\
                </div>\
            ';
    },
    initialize: function(el, data){
        return new permissionTabContentController( data );
    }
}
function permissionTabContentController( data ){
    this.tabId = data.tabId;
    this.active = data.active;
    this.title = data.title;
    this.permList = data.permList;
    this.permType = data.permType;
    this.useroptions = data.useroptions;
    this.optionsType = data.optionsType;
    this.showFacebook = data.showFacebook;

    this.childParam  = {
        allChecked:(function(){
            var opt = data.useroptions[data.optionsType];
            return (opt == "1" || opt == "4");
        })()
    };

}

rivets.components['element-all'] = {
    template: function(){
        return '<div class="_camp _row _active" style="margin-bottom:13px;">\
                    <div class="_div-color _div-color-blue"></div>\
                        <div class="_camp-caption _caption" style="border-right:none;margin-left:25px;"> \
                            <span>All</span> \
                        </div>\
                        <div class="campaigns-list__actions" style="width:20px;">\
                            <!-- <div class="edit_btn"></div> -->\
                            <div class="delete_btn" rv-on-click="deleteRow" style="margin-left:15px;"></div>\
                        </div>\
                    </div>\
                </div>';
    },
    initialize: function( el, data ){
        return new elementAllController( data );
    }
}

function elementAllController( data ){

    this.useroptions = data.useroptions;
    this.optionsType = data.optionsType;

    this.deleteRow = function( event, scope ){
        var tab = $(event.target).parent().parent().parent().parent().parent();

        scope.useroptions['user_group'] = '2';
        if ( $('#group_input').val() == 1  ){
            $('#group_input').val( 2 );
            $('#group_input').trigger("change");
        }

        tab.find( "[name=permission_for_all]" ).prop("checked", false);
        tab.find( "[name=permission_for_all]" ).trigger("change");

        tab.find(".button-inactive").removeClass("button-inactive");
        somethingWasChanged();
    }

}

rivets.components['element-none'] = {
    template: function(){
        return '<div class="_camp _row _active">\
                    <div class="_div-color _div-color-grey"></div>\
                        <div class="_camp-caption _caption" style="border-right:none;margin-left:25px;"> \
                            <span>None</span> \
                        </div>\
                    </div>\
                </div>';
    },
    initialize: function(el, data){
        return new elementNoneController( data );
    }
}
function elementNoneController(data){
    this.elements = data.elements;
}

rivets.components['elements-list'] = {
    template: function(){
        return '\
            <div class="elements-container">\
                <element-none elements="permList.elements" rv-if="isListEmpty | call groups elements childParam groups.changed elements.changed parentParam" ></element-none>\
                <div rv-each-group="makeArray | call groups groups.changed parentParam" class="_camp _row _active" rv-data-group-id="group.index" >\
                    <div class="_div-color _div-color-blue"></div>\
                    <div class="_camp-caption _caption" style="border-right:none"> \
                        <span><span class="_camp-row-id">{group.index}</span>{group.value} <span style="color:#aaa;">(group)</span></span> \
                    </div>\
                    <div class="campaigns-list__actions" style="width:20px;">\
                        <!-- <div class="edit_btn"></div> -->\
                        <div class="delete_btn" rv-on-click="deleteRow" style="margin-left:15px;"></div>\
                    </div>\
                </div>\
                <div rv-each-element="makeArray | call elements elements.changed parentParam" class="_camp _row _active" rv-data-element-id="element.index" >\
                    <div class="_div-color"></div>\
                    <div class="_camp-caption _caption" style="border-right:none"> \
                        <span><span class="_camp-row-id">{element.index}</span>{element.value}</span> \
                    </div>\
                    <div class="campaigns-list__actions" style="width:20px;">\
                        <!-- <div class="edit_btn"></div> -->\
                        <div class="delete_btn" rv-on-click="deleteRow" style="margin-left:15px;"></div>\
                    </div>\
                </div>\
            </div>\
        ';
    },
    initialize: function(el, data){
        return new permissionListController( data );
    }
}
function permissionListController( data ){

    this.parentParam = data.parentParam;
    this.optionsType = data.optionsType;

    this.elements = data.elements;
    if ( this.elements ){
        this.elements.changed = false;
    }
    
    this.groups = data.groups;
    if ( this.groups ){
        this.groups.changed = false;
    }

    this.deleteRow = function(event, scope){
        var rowDiv = $(event.target).parent().parent(),
            type, id;
        if ( typeof rowDiv.attr('data-group-id') != 'undefined' ){
            type = "groups";
            id = rowDiv.attr('data-group-id');
        } else if ( typeof rowDiv.attr('data-element-id') != 'undefined' ) {
            type = "elements";
            id = rowDiv.attr('data-element-id'); 
        }

        if (typeof id == "undefined"){
            throw new Error('Undefined type of row');
        }
        
        delete scope[type][id];
        scope[type].changed = true;
        somethingWasChanged();

        sideAddingMemory.onDeleteInitiator( { type: scope.optionsType, id: id} );

    };

    this.makeArray = function( object, changed, parentParam ){

        if ( typeof object == "undefined" ){
            return;
        }

        var result = new Array();
        // Most of permission data send as object {id: name}
        if (!Array.isArray(object) && typeof object === 'object'){
            for (var prop in object ){
                if ( object.hasOwnProperty(prop) && object.propertyIsEnumerable(prop) && prop != "changed" ){
                    result.push({ index: prop, value: object[prop] });
                }
            }
        } else if (Array.isArray(object)) { // But in few cases (for instance: domain with zero index) it will be array
            for (var i=0;i<object.length;i++) {
                result.push({index: i, value: object[i]});
            }
        }

        if ( object.changed ){
            parentParam.allChecked = false;
            object.changed = false;
        }

        return result;
    }

    this.isListEmpty = function(groups, elements, parentParam ){
        
        if (typeof groups == "undefined"){
            groups = {};
        }
        if (typeof elements == "undefined"){
            elements = {};
        }

        if ( typeof parentParam == "undefined" ){
            parentParam = {};
        }
        // 1 besause 'changed'
        if ( (Object.keys( groups ).length <= 1 && Object.keys( elements ).length <= 1 && parentParam.allChecked != true) ){
             return true;
        }
        return false;
    }

}

rivets.components['elements-list-buttons'] = {

    template: function(){
        var groupButton = '';

        return '<div class="_lp-buttons" style="margin-bottom:20px;">\
                    <a class="green-button" rv-class-button-inactive="parentParam.allChecked" rv-on-click="openElementsWindow" ><img src="./templates/standart/images/w-add.png" class="icon add_icon">{blockType}</a>\
                    <a rv-if="groupAvailable" rv-class-button-inactive="parentParam.allChecked" class="green-button" rv-on-click="openGroupsWindow"><img src="./templates/standart/images/w-add.png" class="icon add_icon">Group</a>\
                    <a class="green-button" rv-class-button-inactive="parentParam.allChecked" rv-on-click="addAll" ><img src="./templates/standart/images/w-add.png" class="icon add_icon">All</a>\
                </div>';
    },
    initialize: function(el, data){
        return new permissionListButtonsController( el, data );
    }
}
function permissionListButtonsController( element, data ){
    this.blockType = data.blockType;
    this.optionsType = data.optionsType;
    this.groups = data.groups;
    this.elements = data.elements;
    this.parentParam = data.parentParam;
    this.groupWindow = null;
    this.elementsWindow = null;

    this.parentElementDOM = $(element).parent();

    this.openElementsWindow = function( event, scope ){

        if ( $( event.currentTarget ).hasClass("button_inactive") || $( event.currentTarget ).hasClass("button-inactive") ){
            return;
        }

        if (scope.optionsType=='campaigns'){
            function callbackOnSaveCampaigns( campaignsToAdd ){
                if (scope.parentParam.allChecked){
                    return;
                }
                scope.parentElementDOM.find("[type=checkbox]").eq(0).trigger("change");
                function addCampaigns( elem ){
                    scope.elements[ elem.id ] = elem.name;
                    // ADD FLOW TO SUB TAB
                    if ( elem.rotation_type==1 ){
                        USERDATA.permissions.rotations.elements[ elem.rotation_id ] = elem.rotation_name;
                        USERDATA.permissions.rotations.elements.changed = true;
                        sideAddingMemory.write( { 
                           "type":"campaigns",
                           "id": elem.id
                        }, {
                            "type": "rotations",
                            "id": elem.rotation_id
                        });
                    }
                    // ADD TS TO SUB TAB
                    if ( elem.sources_id ){
                        USERDATA.permissions.sources.elements[ elem.sources_id ] = elem.ts_name;
                        USERDATA.permissions.sources.elements.changed = true;
                        sideAddingMemory.write( { 
                           "type":"campaigns",
                           "id": elem.id
                        }, {
                            "type": "sources",
                            "id": elem.sources_id
                        });
                    }
                }

                // Adding rotation and ts_id that was connected to campaign
                if ( typeof campaignsToAdd != "undefined" ){
                    if ( Array.isArray( campaignsToAdd ) ){
                        campaignsToAdd.forEach(function( elem ){
                            addCampaigns(elem);
                        }); 
                        scope.elements.changed = true;
                    } else {
                        addCampaigns( campaignsToAdd )                         
                        scope.elements.changed = true;
                    }
                }
                window.vmStore.commit('CLOSE_MODAL_CAMPAIGNS');
                somethingWasChanged();
            }

            window.vmStore.dispatch('INIT_MODAL_CAMPAIGNS', { 
                onApply: callbackOnSaveCampaigns,
                filterArr: Object.keys(scope.elements)
            });

        } else if (scope.optionsType=='landers'){
            function callbackOnSaveLandings( dataToSave ){
                if (scope.parentParam.allChecked){
                    return;
                }
                if ( typeof dataToSave != "undefined" ){
                    if ( Array.isArray( dataToSave ) ) {
                        dataToSave.forEach(function( lander ){
                            scope.elements[lander.id] = lander.name;
                        });
                    } else if ( typeof dataToSave == "object" ) {
                        scope.elements[dataToSave.id] = dataToSave.name;
                    }
                    scope.elements.changed = true;
                    scope.parentElementDOM.find("[type=checkbox]").eq(0).trigger("change");
                }
                window.vmStore.commit( 'CLOSE_MODAL_LANDINGS' );
                somethingWasChanged();
            }

            window.vmStore.dispatch('INIT_MODAL_LANDINGS', { 
                onApply: callbackOnSaveLandings,
                filterArr: Object.keys(scope.elements)
            })
        } else if (scope.optionsType=='offers'){
            function callbackOnSaveOffers( dataToSave ){
                if (scope.parentParam.allChecked){
                    return;
                }
                function addOffer(offer){
                    scope.elements[offer.id] = offer.name;
                    // add network to sub tab if network connected
                    if (offer.network && offer.network!=0){
                        USERDATA.permissions.networks.elements[ offer.network ] = offer.network_name;
                        USERDATA.permissions.networks.elements.changed = true;
                        sideAddingMemory.write( { 
                           "type":"offers",
                           "id": offer.id
                        }, {
                            "type": "networks",
                            "id": offer.network
                        });
                    }
                }
                if ( typeof dataToSave != "undefined" ){
                    if ( Array.isArray( dataToSave ) ) {
                        dataToSave.forEach(function( offer ){
                            addOffer(offer);
                        });
                    } else if ( typeof dataToSave == "object" ) {
                        addOffer( dataToSave );
                    }
                    scope.elements.changed = true;
                    scope.parentElementDOM.find("[type=checkbox]").eq(0).trigger("change");

                }
                window.vmStore.commit('CLOSE_MODAL_OFFERS');
                somethingWasChanged();
            }

            window.vmStore.dispatch('INIT_MODAL_OFFERS', { 
                onApply: callbackOnSaveOffers,
                filterArr: Object.keys(scope.elements)
            })
        } else {
            var apiParams;
            if (scope.optionsType=='rotations'){
                apiParams = 'action=rotation@get_all';
                headerName = 'Choose Rotation';
            } else if (scope.optionsType=="sources"){
                apiParams = 'action=traffic_source@get_all';
                headerName = 'Choose Traffic Source';
            } else if (scope.optionsType=="networks"){
                apiParams = 'action=affiliate_network@get_all';
                headerName = 'Choose Affiliate Network';
            } else if (scope.optionsType=="domains") {
                apiParams = 'action=domain@get_all';
                headerName = 'Choose Domain';
            }

            function callbackOtherSimpleSave( dataToSave ){
                if (scope.parentParam.allChecked){
                    return;
                }

                if ( Array.isArray( dataToSave ) && dataToSave.length > 0 ){
                    for ( var i=0, l=dataToSave.length;i<l;i++ ){
                        scope.elements[dataToSave[i].id] = dataToSave[i].name;
                    } 
                    scope.parentParam.allChecked = false;
                } else if (typeof dataToSave == "object") {
                    scope.elements[dataToSave.id] = dataToSave.name;
                    scope.parentParam.allChecked = false;
                }
                scope.elements.changed = true;
                scope.parentElementDOM.find("[type=checkbox]").eq(0).trigger("change");

                window.vmStore.commit('CLOSE_MODAL_SIMPLE_LIST');
                somethingWasChanged();
            }

            var actionName = 'INIT_MODAL_SIMPLE_LIST'
            if (scope.optionsType === 'domains') {
                actionName = 'INIT_MODAL_DOMAINS';
            } 
            // Убрать стрелки
            window.vmStore.dispatch(actionName, {
                params: apiParams, 
                headerName: headerName, 
                onApply: callbackOtherSimpleSave,
                filterArr: Object.keys(scope.elements)
            })

        }
    }

    this.openGroupsWindow = function( event, scope ){
        var group_type;

        if ( $( event.currentTarget ).hasClass("button_inactive") || $( event.currentTarget ).hasClass("button-inactive") ){
            return;
        }

        var groupType, headerName;

        switch( scope.optionsType ){
            case("campaigns"):
                group_type = 1;
                headerName = 'Choose Campaigns group';
            break;
            case("landers"):
                group_type = 2;
                headerName = 'Choose Landers group';
            break;
            case("offers"):
                group_type = 3;
                headerName = 'Choose Offers group';
            break;
            case("rotations"):
                group_type = 4;
                headerName = 'Choose Rotations group';
            break;
        }


        function callbackOnApply( dataToSave ){
            if (scope.parentParam.allChecked){
                return;
            }
            if ( Array.isArray( dataToSave ) && dataToSave.length >0 ){
                for ( var i=0, l=dataToSave.length;i<l;i++ ){
                    scope.groups[dataToSave[i].id] = dataToSave[i].name;
                } 
                scope.parentParam.allChecked = false;
            } else if (typeof dataToSave == "object") {
                scope.groups[dataToSave.id] = dataToSave.name;
                scope.parentParam.allChecked = false;
            }
            scope.groups.changed = true;
            scope.parentElementDOM.find("[type=checkbox]").eq(0).trigger("change");
            window.vmStore.commit('CLOSE_MODAL_SIMPLE_LIST');
            somethingWasChanged();
        }

        window.vmStore.dispatch('INIT_MODAL_SIMPLE_LIST', {
            params: 'action=group@find&type='+group_type, 
            headerName: headerName, 
            onApply: callbackOnApply,
            filterArr: Object.keys(scope.groups)
        });

    }

    this.groupAvailable = (function(optionsType){
        if ( optionsType=='networks' || optionsType=='sources' || optionsType=='domains' ){
            return false;
        } else {
            return true;
        }

    })( this.optionsType );

    this.addAll = function( event, scope ){
        
        if ( $( event.currentTarget ).hasClass("button-inactive") ){
            return;
        }

        var tab = $(event.currentTarget).parent().parent().parent();
        tab.find("[name=permission_for_all]").prop("checked", true);
        tab.find("[name=permission_for_all]").trigger("change");
        somethingWasChanged();
        
    }
}

rivets.components['elements-list-checkboxes'] = {
    template: function(){
        return '<div style="height:50px;margin-top:-20px;">\
                    <label style="display:none;">\
                        <input type="checkbox" rv-checked="parentParam.allChecked" rv-on-change="changeAllChecked" name="permission_for_all"/>All\
                    </label><br>\
                    <label>\
                        <input type="checkbox" rv-checked="readOnlyChecked" rv-on-change="changeReadOnly" style="margin-right:7px;" />Readonly\
                    </label>\
                </div>';
    },
    initialize: function(el, data){
        return new permissionListCheckboxesController( data );
    }
}
function permissionListCheckboxesController( data ){
    this.permType = data.permType;

    this.useroptions = data.useroptions;
    this.optionsType = data.optionsType;

    this.readOnlyChecked = (this.useroptions[this.optionsType]==3||this.useroptions[this.optionsType]==4);

    this.parentParam = data.parentParam;

    this.isChecked = function(){

    }

    this.changeAllChecked = function(event, scope){

        if ( scope.useroptions["user_group"] == 1 ){
            scope.parentParam.allChecked = true;
            return;
        }

        if (event.target.checked){
            scope.parentParam.allChecked = true;
            if ( scope.readOnlyChecked ){
                scope.useroptions[scope.optionsType] = '4';
            } else {
                scope.useroptions[scope.optionsType] = '1';
            }
        } else {
            scope.parentParam.allChecked = false;
            if ( scope.readOnlyChecked ){
                scope.useroptions[scope.optionsType] = '3';
            } else {
                scope.useroptions[scope.optionsType] = '2';
            }
        }
        
    };

    this.changeReadOnly = function( event, scope ){
        
        if ( scope.useroptions["user_group"] == 1 ){
            scope.readOnlyChecked = false;
            return;
        }

        if ( event.target.checked ){
            scope.readOnlyChecked = true;
            if ( scope.parentParam.allChecked ){
                scope.useroptions[scope.optionsType] = '4';
            } else {
                scope.useroptions[scope.optionsType] = '3';
            }
        } else {
            scope.readOnlyChecked = false;
            if ( scope.parentParam.allChecked ){
                scope.useroptions[scope.optionsType] = '1';
            } else {
                scope.useroptions[scope.optionsType] = '2';
            }
        }

    };
}