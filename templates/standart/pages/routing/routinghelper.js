var RoutingHelper = (function(){
  function isArray(target) {
    return Object.prototype.toString.call(target) === '[object Array]'
  }

  var fields = [
    'landings',
    'offers',
    'paths',
    'rules',
  ];

  function overRouting(
    listProcessor,
    itemProcessor,
    routing,
    fieldsToIterate = fields,
    flags = { isStop: false },
  ) {
    if (!routing) {
      return;
    }
    function stop() {
      flags.isStop = true;
    }
    fieldsToIterate.forEach(function (field) {
      if (flags.isStop) {
        return;
      }
      const potentialList = routing[field];
      if (isArray(potentialList)) {
        let resultOfListProcessing = null;
        if (typeof listProcessor === 'function') {
          resultOfListProcessing = listProcessor(potentialList, stop);
        }

        (isArray(resultOfListProcessing) ? resultOfListProcessing : potentialList)
          .forEach(function (item, index, list) {
            if (typeof itemProcessor === 'function') {
              itemProcessor(item, index, list, stop);
            }

            overRouting(listProcessor, itemProcessor, item, fieldsToIterate, flags);
          });
      }
    });
  }

  var lists = {
  };

  var waitFor = function (predicate, after) {
    var intervalId = setInterval(function () {
      if (!predicate()) {
        return;
      }
      clearInterval(intervalId);
      after();
    });
  }

  var observeRoutingToCacheListsByItsChildrenIds = function () {
    var observed = {
    };

    var observe = function (listContainer, listFieldName, action) {
      var iterate = function () {
        var list = listContainer[listFieldName];
        list.forEach((item) => {
          waitFor(function () { return item._rv; }, function () {
            var id = item._rv;
            lists[id] = list;
            if (observed[id]) {
              return;
            }
            observed[id] = true;
            if (action) {
              action(item);
            }
          });
        });
      };

      rivets.adapters['.'].observe(listContainer, listFieldName, iterate);

      iterate();
    };

    observe(ROUTING, 'paths', function (path) {
      observe(path, 'landings');
      observe(path, 'offers');
    });

    observe(ROUTING, 'rules', function (rule) {
      observe(rule, 'criteria');
      observe(rule, 'paths', function (path) {
        observe(path, 'landings');
        observe(path, 'offers');
      });
    });
  };

  function checkIfListContainsItem(list, item) {
    return list.some((testingItem) => testingItem._rv === item._rv);
  }

  function findList(item) {
    let list = null;
    var alreadyBindList = lists[item._rv];
    if (alreadyBindList) {
      /*
      * check if list contains searching item to exclude possible mistakes
      * */
      var isContainsItem = checkIfListContainsItem(alreadyBindList, item);
      if (isContainsItem) {
        return alreadyBindList;
      } else {
        delete lists[item._rv];
      }
    }
    overRouting(null, function (testingItem, __, testingList, stop) {
      if (testingItem._rv !== item._rv) {
        return;
      }
      list = testingList;
      stop();
    }, ROUTING, fields.concat([
      'criteria',
    ]));
    return list;
  }

  /*
  * because of rivets.js updates item fields in controller (like 'this.path', 'this.rule' etc.)
  * but don't updates list fields (like 'this.paths', 'this.rules' etc.)
  * find actual list by its child is most safe way to remove item
  * */
  var removeItem = function (item) {
    var list = findList(item);
    if (!list) {
      return;
    }
    list.remove(item);
  };

  function removeRule(rule) {
    ROUTING.rules.remove(rule);
  }

  function removePath(path) {
    removeItem(path);
  }

  function removeLanding(landing) {
    removeItem(landing);
  }

  function removeOffer(offer) {
    removeItem(offer);
  }

  function removeCriterion(criterion) {
    removeItem(criterion);
  }

  function addNumber(item, index, items) {
    item.number = index + 1;
  }

  function addNumbersToRoutingMutable(routing) {
    overRouting(null, addNumber, routing);
  }

  function numberComparator(left, right) {
    return (left.number || 0) - (right.number || 0);
  }

  function sortByNumbers(items) {
    items
      .sort(numberComparator);
  }

  function sortRoutingMutable(routing) {
    overRouting(sortByNumbers, null, routing);
  }

  var clearPaths = function(paths){
      for (var i=0, l=paths.length;i<l;i++){
        clearPath(paths[i]);
      }
    },

    clearRules = function(rules){
      for (var i=0, l=rules.length;i<l;i++){
        clearRule(rules[i]);
      }
    },

    clearPath = function(path){
      delete path.id;
      delete path.rotation_id;
      delete path.rule_id;

      // Clear landings for ids
      if ( path.landings ){
        path.landings.forEach( function(item, index){
          delete path.landings[index].id;
          delete path.landings[index].path_id;
        });
      }
      // Clear offers for ids
      if ( path.offers ){
        path.offers.forEach( function(item, index){
          delete path.offers[index].id;
          delete path.offers[index].path_id;
        });
      }

      return path;
    },

    clearRule = function(rule){
      delete rule.id;
      delete rule.rotation_id;
      delete rule.camp_id;

      if ( rule.paths ){
        rule.paths.forEach(function(item, index){
          rule.paths[index] = clearPath(rule.paths[index]);
        });
      }

      if ( rule.criteria ){
        rule.criteria.forEach(function(item, index){
          delete rule.criteria[index].id;
        })
      }

      return rule;
    },

    editTokens = function( rules ){
      if ( typeof ROUTING == "undefined" ){
        return;
      }
      var campaignTokens = ROUTING.tokens;
      for ( var i=0,l=rules.length;i<l;i++ ){

        if ( rules[i].criteria ){

          rules[i].criteria.forEach( function( criterion, j ){

            if ( rules[i].criteria[j].type>80 && rules[i].criteria[j].type<91 ){ // Tokens from rotation
              var numberOfSavedToken = criterion.type-81;

              if (ROUTING.tokens[numberOfSavedToken]){
                var tokenID = 90+parseInt( ROUTING.tokens[numberOfSavedToken].id ) || 0;
                var currentCampaignTokenType = (tokenID).toString();

                rules[i].criteria[j].type = currentCampaignTokenType;
              }

            }
          });

        }

      }

    },

    clearRouting = function(routing){
      clearPaths(routing.paths);
      clearRules(routing.rules);
      editTokens(routing.rules);
    },

    routingChanged = function(){
      if (typeof $("#rotation_input").val() != 'undefined' && $("#rotation_input").val() != 0) {
        $("#rotation_input").val( 0 );
        RoutingHelper.clearRouting( ROUTING );
        window.vmStore.commit('CHANGE_ROTATION', {rotation_id: 0});
      }
    },

    getKeyCode = function(e){
      return (e.keyCode ? e.keyCode : e.which);
    },

    getToggleId = function(){
      var number=0;
      return function(){return "tgl-id-"+ (++number);}
    }(),

    makeEmptyPath = function(paths){
      var number;
      if (typeof paths == "undefined"){
        number = 1;
      } else {
        number = paths.length + 1;
      }
      return {
        "name":"Path " + number,
        "status":1,
        "split" :100,
        "isHidden": false,
        "landings": [],
        "offers" : []
      };
    },

    makeEmptyRule = function(rules){

      var number;
      if (typeof rules == "undefined"){
        number = 1;
      } else {
        number = rules.length + 1;
      }

      return {
        "name":"Rule "+number,
        "status":1,
        "criteria" : [],
        "isHidden": false,
        "paths":new Array(makeEmptyPath()),
        "number" : number
      };
    },

    addZclip = function(caller, target){
      $(caller).zclip({
        path:"templates/standart/js/jquery-zclip/ZeroClipboard.swf",
        copy:$(target).val(),
        beforeCopy:function(){
        },
        afterCopy:function(){
          $(caller).addClass("blue-button");
          $(caller).html("Done");
          setTimeout(function(){
            $(caller).removeClass("blue-button");
            $(caller).html("Copy");
          },2000);
        }
      });
    },

    /**
     * @param block   {object}  path or rule object from ROUTING
     * @param message {message} message for alerting
     */
    makeRoutingAlert = function(block, message){
      makeBadAlertModal("OK", message).show();
    },

    // Добавить
    validateRoutingPath = function(path, index, rule_name){
      var additional_info = "";

      if (typeof rule_name !== "undefined"){
        additional_info = "Rule #" + rule_name;
      } else if (typeof rule_name !== "undefined" && rule_name.trim()===""){
        additional_info = "Rule Unnamed";
      }

      if (path.landings.length==0){
        makeRoutingAlert(path , "Please, add landings or Direct landing to " + additional_info + " path #" + path.name);
        return false;
      }

      if (path.offers.length==0){
        makeRoutingAlert(path , "Please, add offers to " + additional_info + " path #" + path.name);
        return false;
      }

      var active_landings = 0;
      for (var i=0; i<path.landings.length; i++){
        if (path.landings[i].status!=0){
          active_landings++;
        }
      }

      var active_offers = 0;
      for (var i=0; i<path.offers.length; i++){
        if (path.offers[i].detail.name=="#Choose Offer#"){
          makeRoutingAlert(path , "Please, choose offer in " + additional_info + " path #" + path.name);
          return false;
        }
        if (path.offers[i].type==4 && (!path.offers[i].detail.url || path.offers[i].detail.url==0 || !path.offers[i].detail.url.trim())){
          makeRoutingAlert(path , "Please, enter URL of Direct-offer in " + additional_info + " path #" + path.name);
          return false;
        }
        if (path.offers[i].status!=0){
          active_offers++;
        }
      }

      if (active_landings==0){
        makeRoutingAlert(path , "Please, add or unpause any landing " + additional_info + " path #" + path.name);
        return false;
      }

      if (active_offers==0){
        makeRoutingAlert(path , "Please, add or unpause any offer " + additional_info + " path #" + path.name);
        return false;
      }

      // Check name
      if (!path.name || path.name.trim()==""){
        makeRoutingAlert(path , "Please, enter name in " + additional_info + " path " + (index+1) );
        return false;
      }
      return true;
    },

    validateRoutingRule = function(rule, index){
      var ruleIsActive = rule.status != 0;

      // Check name
      if (!rule.name || rule.name.trim()==""){
        makeRoutingAlert(rule , "Please, enter name for rule " + (index+1));
        return false;
      }

      if (rule.criteria.length==0){
        makeRoutingAlert(rule , "Please, add criteria to rule #" + rule.name);
        return false;
      }

      var allRulesCriteriasArePaused = rule.criteria.every(function (singleCriteria) {
        return singleCriteria.status == 0;
      });

      if (allRulesCriteriasArePaused && ruleIsActive){
        makeRoutingAlert(rule , "Please, unpause at least one criteria in the rule #" + rule.name + " or pause/delete this rule");
        return false;
      }
      var valid_rule_paths = false,
        paused_paths = 0;
      for (var i=0; i<rule.paths.length;i++){
        valid_rule_paths = validateRoutingPath(rule.paths[i], i, rule.name);
        if (!valid_rule_paths){
          return false;
        }
        if (rule.paths[i].status==0){
          paused_paths += 1;
        }
      }
      if (paused_paths==rule.paths.length && ruleIsActive){
        makeRoutingAlert(rule , "Please, add active path to rule #" + rule.name);
        return false;
      }


      return true;
    },

    // Semi public api
    clear = function(){
      ROUTING.paths = [];
      ROUTING.paths.push( makeEmptyPath() );
      ROUTING.rules = [];
      ROUTING.current_rotation = {id: 0, isFlow: false};
      routingChanged();
    },

    copyEntity = function(entity, localStorageKey) {
      var resultJSON;
      if (Array.isArray(entity)) {
        resultJSON = JSON.stringify(entity);
      } else {
        entity.name = 'Copy of ' + entity.name;
        resultJSON = JSON.stringify( [entity] );
      }
      localStorage.setItem(localStorageKey, resultJSON);
    },

    pasteCopiedEntity = function(localStorageKey, getter, setter) {
      var entities = JSON.parse(localStorage.getItem(localStorageKey));
      var newEntities = getter().slice();
      Array.prototype.unshift.apply(newEntities, entities);
      setter([]);
      setter(newEntities);
      somethingWasChanged();
    },

    clearCopiedEntities = function(localStorageKey){
      localStorage.removeItem(localStorageKey);
    },

    copyRule = function(rule) {
      copyEntity(rule, 'copied_rules');
    },

    pasteCopiedRule = function(getter = () => ROUTING.rules, setter = (rules) => ROUTING.rules = rules) {
      pasteCopiedEntity('copied_rules', getter, setter);
    },

    clearCopiedRule = function(){
      clearCopiedEntities('copied_rules');
      $(".paste_rules_templates").css({"display" : "none"});
      $(".clear_rules_templates").css({"display" : "none"});
    },

    copyPath = function(path) {
      copyEntity(path, 'copied_paths');
      onCopiedPathsUpdated();
    },

    pasteCopiedPath = function(getter = () => ROUTING.paths, setter = (paths) => ROUTING.paths = paths) {
      pasteCopiedEntity('copied_paths', getter, setter);
    },

    clearCopiedPath = function(){
      clearCopiedEntities('copied_paths');
      onCopiedPathsUpdated();
    },

    onCopiedPathsUpdated = function () {
      var copiedPathsNonParsed = localStorage.getItem('copied_paths');
      var copiedPaths = copiedPathsNonParsed && JSON.parse(copiedPathsNonParsed);
      var copiedPathsCount = copiedPaths && Array.isArray(copiedPaths)
        ? copiedPaths.length
        : 0;
      onCopiedPathsCountChanges(copiedPathsCount);
    },

    onCopiedPathsCountChanges = function(count) {
      if(!count) {
        hideCopyPathButtons();
      } else {
        showCopyPathButtons();
        var pastePathBtnText = count > 1
          ? 'Paste paths'
          : 'Paste path';
        $(".paste-path-btn > span").text(pastePathBtnText);
      }
    },

    showCopyPathButtons = function() {
      $(".paste-path-btn").css({"display" : "inline-block"});
      $(".clear-paths-buffer-btn").css({"display" : "inline-block"});
    },

    hideCopyPathButtons = function() {
      $(".paste-path-btn").css({"display" : "none"});
      $(".clear-paths-buffer-btn").css({"display" : "none"});
    },

    routingTemplater = function (){
      this.ROUTING = ROUTING;
      return {
        exportRules: function(json){
          if (typeof json == "undefined"){
            json = false;
          }

          var i=0,
            j=0,
            k=0,
            export_obj = {};
          export_obj.rules = new Array();
          // Clearing export object
          for (i=0;i<ROUTING.rules.length;i++){
            export_obj.rules.push(cloneObject(ROUTING.rules[i]));
            delete export_obj.rules[i].id;
            delete export_obj.rules[i].camp_id;
            delete export_obj.rules[i].minimized;
            for (j=0;j<export_obj.rules[i].criteria.length;j++){
              delete export_obj.rules[i].criteria[j].id;
            }
            for (j=0;j<export_obj.rules[i].paths.length;j++){
              delete export_obj.rules[i].paths[j].id;
              delete export_obj.rules[i].paths[j].camp_id;
              delete export_obj.rules[i].paths[j].camp_id;
              delete export_obj.rules[i].paths[j].minimized;
              for (k=0;k<export_obj.rules[i].paths[j].landings.length;k++){
                delete export_obj.rules[i].paths[j].landings[k].id;
                delete export_obj.rules[i].paths[j].landings[k].path_id;
              }
              for (k=0;k<export_obj.rules[i].paths[j].offers.length;k++){
                delete export_obj.rules[i].paths[j].offers[k].path_id;
                delete export_obj.rules[i].paths[j].offers[k].id;
              }
            }
          }
          if (json){
            return JSON.stringify(export_obj);
          } else {
            return export_obj;
          }
        },
        // TODO получится хреново, наверное
        importRules: function(import_data){
          if (typeof import_data == "string"){
            rules = JSON.parse(import_data)["rules"];
          } else if (typeof import_data== "object") {
            rules = import_data["rules"];
          }
          ROUTING.rules.splice(0, ROUTING.rules.length);
          for (var i=0;i<rules.length;i++){
            ROUTING.rules.push(rules[i]);
          }
        },
        /*saveRulesToStorage: function(){
            var rules = this.exportRules(true);
            localStorage.setItem('rules_import', rules);
        },
        importRulesFromStorage: function(){
            var import_data = localStorage.getItem('rules_import');
            this.importRules(import_data);
            //localStorage.removeItem("rules_import");
        },*/

        clearStorage: function(){
          localStorage.removeItem("rules_import");
          $(".paste_rules_templates").css({"display" : "none"});
          $(".clear_rules_templates").css({"display" : "none"});
        },

      }
    };

  return {
    clearPath: clearPath,
    clearRule: clearRule,
    clearPaths: clearPaths,
    clearRules: clearRules,
    observeRoutingToCacheListsByItsChildrenIds: observeRoutingToCacheListsByItsChildrenIds,
    findList: findList,
    removeItem: removeItem,
    removeRule: removeRule,
    removePath: removePath,
    removeLanding: removeLanding,
    removeOffer: removeOffer,
    removeCriterion: removeCriterion,
    routingChanged: routingChanged,
    getToggleId: getToggleId,
    makeEmptyPath: makeEmptyPath, // *
    makeEmptyRule: makeEmptyRule, // *
    addZclip: addZclip,
    makeRoutingAlert: makeRoutingAlert,
    validateRoutingPath: validateRoutingPath,
    validateRoutingRule: validateRoutingRule,
    clear: clear,
    clearRouting: clearRouting,
    routingTemplater: routingTemplater,
    copyRule: copyRule,
    pasteCopiedRule: pasteCopiedRule,
    clearCopiedRule:clearCopiedRule,
    copyPath: copyPath,
    pasteCopiedPath: pasteCopiedPath,
    clearCopiedPath: clearCopiedPath,
    onCopiedPathsUpdated: onCopiedPathsUpdated,
    onCopiedPathsCountChanges: onCopiedPathsCountChanges,
    showCopyPathButtons: showCopyPathButtons,
    hideCopyPathButtons: hideCopyPathButtons,
    addNumbersToRoutingMutable: addNumbersToRoutingMutable,
    sortRoutingMutable: sortRoutingMutable,
  }

})();
