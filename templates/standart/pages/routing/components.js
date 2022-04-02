/*
    Need to be carefull.
    Handling click of check-all button
    intersects with those that in windowhelper.
*/
rivets.components['campaigns-list'] = {
    template: function(){
        return '<div >\
                    <div class="_camp-list">\
                        <div rv-each-campaign="campaigns">\
                            <div class="_camp _row _active">\
                                <div class="_div-color"></div>\
                                <div class="_camp-caption _caption"> \
                                    <span rv-class-hidden="state.editable"><span class="_camp-row-id">{campaign.id}</span>{campaign.name}</span> \
                                </div>\
                                <div class="campaigns-list__actions">\
                                    <div rv-on-click="editCampaignClick" rv-data-camp-id="campaign.id" class="edit_btn"></div>\
                                    <div rv-if="campaign.not_saved" rv-on-click="deleteCampaignClick" rv-data-camp-id="campaign.id" class="delete_btn"></div>\
                                </div>\
                            </div>\
                        </div>\
                    </div>\
                    <a rv-on-click="addCampaignClick" class="green-button"><img src="./templates/standart/images/w-add.png" class="icon add_icon">Add Campaigns</a>\
                </div>';
    },
    initialize: function(el, data){
        return new campaignsListController(data);
    }
}

function campaignsListController(data){
    this.campaigns = data.campaigns;

    this.editCampaignClick = function(event, scope){
        var camp_id = $(event.target).attr("data-camp-id"),
          camp_url = "?page=edit_camp&id="+camp_id;
        win = window.open(camp_url, '_blank');
    },
      this.deleteCampaignClick = function(event, scope){

          var camp_id = $(event.target).attr("data-camp-id"),
            camp_url = "?page=edit_camp&id="+camp_id;
          var filtered = scope.campaigns.filter(function(item){

              if (item.id == camp_id) {
                  return false;
              } else {
                  return true;
              }

          });
          scope.campaigns.splice(0,scope.campaigns.length);

          for (var i=0,l=filtered.length;i<l;i++){
              scope.campaigns.push(filtered[i]);
          }

      },
      this.addCampaignClick = function(event, scope){

          window.vmStore.dispatch('INIT_MODAL_CAMPAIGNS', {
              onApply: function(campaigns){
                  if (Array.isArray(campaigns)){
                      campaigns.forEach(function(camp){
                          scope.campaigns.push( { name: camp.name, id: camp.id, not_saved: true } );
                      });
                  } else if (typeof campaigns == "object") {
                      scope.campaigns.push( { name: campaigns.name, id: campaigns.id, not_saved: true } );
                  }
                  window.vmStore.commit('CLOSE_MODAL_CAMPAIGNS');

                  somethingWasChanged();
              },
              filterArr: ROUTING.campaigns.map(function(camp){return camp.id})
          })

      }

}



// Rules components
rivets.components['rules-block'] = {
    template: function(){
        return '<h2 class="camp_edit_caption rules_header_block">RULES <div class="copyall_rules_btn"></div>\
                <div class="template_rules_button_wrapper">\
                    <!-- <span class="copy_rules_templates blue-button">Copy</span>-->\
                    <span class="paste_rules_templates green-button" style="display:none;">\
                        <div class="paste_rule_icon_routing"></div>\
                        <div style="display:inline-block;">Paste rule</div>\
                    </span>\
                    <span class="clear_rules_templates gray-button" style="display:none;">\
                        <div class="clear_buffer_icon_routing"></div>\
                        <div style="display:inline-block">Clear buffer</div>\
                    </span>\
                </div>\
                </h2>\
                <div class="_paths _rules">\
                    <div class="_paths_header" rv-class-empty-routing-block-header="isEmpty | call rules">\
                        <div class="_list-collapser"  rv-on-click="minimizeAction" rv-class-_closed-collapser="state.minimized"><div class="_collapser-button"></div></div>\
                        <div class="_caption-block _caption"><span style="color:#E53935;">RULES</span></div>\
                        <div class="_path-weight" ><span>Weight</span></div>\
                        <div class="_path-actions"><span>Actions</span></div>\
                    </div>\
                    <div class="rules_wrapper">\
                        <div><rule-block class="_rule_block" rv-each-rule="rules" rule="rule" rules="rules"></rule-block><div>\
                    </div>\
                </div>\
                ';
    },
    initialize: function(el, data){
        return new rulesBlockController(data);
    }
};
function rulesBlockController(data){
    this.rules = data.rules;
    this.isEmpty = function(rules){
        if (rules.length==0){
            return true;
        } else {
            return false;
        }
    }
    this.state = {};
    this.state.minimized = (function(rules) {
        if (rules.length == 0) {
            return false;
        } else {
            return rules.length == rules.reduce(function(acc, rule) {
                if (rule.id && window.ROUTING_UTIL_STORAGE.isRuleMinimized(rule.id)) acc += 1;
                return acc;
            }, 0);
        }
    })(this.rules);
    this.minimizeAction = function(event, scope){
        scope.state.minimized = !scope.state.minimized;
        if (scope.state.minimized==true){
            for (var i=0;i<scope.rules.length;i++){
                scope.rules[i].minimized = true;
                if (scope.rules[i].id) {
                    window.ROUTING_UTIL_STORAGE.writeMinimizedRule(scope.rules[i].id, true);
                }
            }
        } else {
            for (var i=0;i<scope.rules.length;i++){
                if (scope.rules[i].status!=0){
                    scope.rules[i].minimized = false;
                    if (scope.rules[i].id) {
                        window.ROUTING_UTIL_STORAGE.writeMinimizedRule(scope.rules[i].id, false);
                    }
                }
            }
        }

    };
};

function extractMousePositionFromEvent(event) {
    return {
        x: event.pageX,
        y: event.pageY,
    };
};

function notEqualTo(left) {
    return function (right) {
        return left !== right;
    };
}

function EventHandlers(owner = null) {
    this.__handlers = {};

    this.__updateHandlers = function (updater, event, handler) {
        this.__handlers[event] = updater(this.__handlers[event] || [], event, handler);
    }

    this.add = this.__updateHandlers.bind(this, function (handlers, event, handler) {
        return handlers.concat(handler);
    });

    this.remove = this.__updateHandlers.bind(this, function (handlers, event, handler) {
        return handlers.filter(notEqualTo(handler));
    });

    if (owner) {
        owner.addHandler = this.add.bind(this);
        owner.removeHandler = this.remove.bind(this);
    }

    this.call = function (event, payload) {
        (this.__handlers[event] || []).forEach(function (callback) {
            callback(payload);
        });
    }
}

function MousePositionTracker() {
    this.__downPosition = null
    this.__currentPosition = null;
    this.__eventHandlers = new EventHandlers(this);
    this.__startTrigger = null;

    this.start = function (position, element) {
        this.__downPosition = position;
        this.__startTrigger = element;
        this.__currentPosition = this.__downPosition;
        this.__eventHandlers.call('start', this);
    };

    this.update = function (position) {
        if (!this.isStarted) {
            return;
        }
        this.__currentPosition = position;
        this.__eventHandlers.call('update', this);
    }

    this.updateWithDelta = function (delta) {
        if (!this.__currentPosition) {
            return;
        }
        this.update({
            x: this.__currentPosition.x + delta.x,
            y: this.__currentPosition.y + delta.y,
        });
    }

    this.stop = function () {
        this.__downPosition = null;
        this.__startTrigger = null;
        this.__currentPosition = null;
        this.__eventHandlers.call('stop', this);
    }

    this.getDelta = function (field) {
        if (!this.__currentPosition || !this.__downPosition) {
            return 0;
        }
        return this.__currentPosition[field] - this.__downPosition[field];
    };

    Object.defineProperty(this, 'maxDelta', {
        get() {
            return Math.max.apply(
              Math,
              ['x', 'y']
                .map(this.getDelta.bind(this))
                .map(Math.abs),
            );
        },
    });

    Object.defineProperty(this, 'isStarted', {
        get() {
            return this.__downPosition !== null;
        },
    });

    Object.defineProperty(this, 'startTrigger', {
        get() {
            return this.__startTrigger;
        },
    });
}

function DraggingTracker(options) {
    this.__isDragging = null;
    this.__isTrackingMousePosition = false;
    this.__mousePositionTracker = null;
    this.__eventHandlers = new EventHandlers(this);

    this.useMousePositionTracker = function (tracker) {
        this.__mousePositionTracker = tracker;

        this.__mousePositionTracker.addHandler('update', this.handleUpdateOfMousePositionTracking.bind(this));
        this.__mousePositionTracker.addHandler('stop', this.handleStopOfMousePositionTracking.bind(this));
    }

    this.isDraggingAllowed = function () {
        if (options.isDraggingAllowed) {
            return options.isDraggingAllowed();
        }
        return true;
    }

    this.handleUpdateOfMousePositionTracking = function (tracker) {
        if (!this.__isTrackingMousePosition || !this.isDraggingAllowed()) {
            return;
        }

        if (this.__isDragging) {
            this.__eventHandlers.call('continue', this);
            return;
        }

        if (tracker.maxDelta < 10) {
            return;
        }

        this.__isDragging = true;
        this.__eventHandlers.call('start', this);
    }

    this.handleStopOfMousePositionTracking = function () {
        this.__isTrackingMousePosition = false;
        if (!this.__isDragging) {
            return;
        }
        this.__isDragging = false;
        this.__eventHandlers.call('stop', this);
    }

    this.startToTrackMousePosition = function (position) {
        this.__isTrackingMousePosition = true;
        this.__mousePositionTracker.start(position);
    }

    Object.defineProperty(this, 'isDragging', {
        get() {
            return this.__isDragging;
        },
    });

    this.isDraggingBy = function (element) {
        return this.isDragging && this.__mousePositionTracker.startTrigger === element;
    }
}

function computeHeightByChildren(element) {
    return Array
      .from(element.children)
      .map(function (child) {
          return child.clientHeight;
      })
      .reduce(function (sum, height) {
          return sum + height;
      });
}

function GhostBlock () {
    this.__element = document.createElement('div');

    this.__owner = null;

    this.ownsBy = function (element) {
        this.__owner = element;
    }

    this.mount = function () {
        if (!this.__owner) {
            return;
        }
        const height = computeHeightByChildren(this.__owner);
        this.__element.style.height = height + 'px';
        const firstOwnerChild = this.__owner.children[0];
        if (firstOwnerChild) {
            const computedStyle = window.getComputedStyle(firstOwnerChild, null);

            this.__element.style.marginBottom = computedStyle.marginBottom;
            this.__element.style.marginTop = computedStyle.marginTop;
        }

        this.__owner.before(this.__element);
    };

    this.unmount = function () {
        this.__element.remove();
        this.__element.style.height = '';
        this.__element.style.marginBottom = '';
        this.__element.style.marginTop = '';
    };

    Object.defineProperty(this, 'element', {
        get () {
            return this.__element;
        },
    });
}

function inPixels(value) {
    if (typeof value === 'string' && value.endsWith('px')) {
        return value;
    }
    return value + 'px';
}

function makeTranslate3dCssRule (points) {
    return [
        'translate3d(',
        points
          .map(inPixels)
          .join(','),
        ')',
    ].join('');
}

function preventCapturedClickPropagationOnce (element) {
    function handleClick (event) {
        element.removeEventListener('click', handleClick, true);
        event.stopPropagation();
    }
    element.addEventListener('click', handleClick, true);
}

function elementsHaveSameTagName(left, right) {
    return left.tagName.toLowerCase() === right.tagName.toLowerCase();
}

function findFirstFittingSibling(element, searchDirection, isFitting) {
    if (['next', 'previous'].indexOf(searchDirection) === -1 || !element || typeof isFitting !== 'function') {
        return null;
    }

    const siblingProperty = searchDirection === 'next'
      ? 'nextElementSibling'
      : 'previousElementSibling';

    const siblingToCheck = element[siblingProperty];

    if (!siblingToCheck) {
        return null;
    }

    if (isFitting(siblingToCheck)) {
        return siblingToCheck;
    }

    return findFirstFittingSibling(siblingToCheck, searchDirection, isFitting);
}


function findFirstSimilarSibling(element, searchDirection, isSimilar = elementsHaveSameTagName) {
    return findFirstFittingSibling(element, searchDirection, isSimilar.bind(null, element));
}

function throttle (callback, timeout = 30, shouldDebounceAsWell = false) {
    let lastCallTime = 0;
    let debouncedTimeoutId = null;
    return function () {
        const passedArguments = arguments;

        const callTime = Date.now();
        const passedEnoughTime = (callTime - lastCallTime) > timeout;

        if (passedEnoughTime) {

            lastCallTime = callTime;
            callback.apply(null, passedArguments);
            return;
        }

        if (!shouldDebounceAsWell) {
            return;
        }

        if (debouncedTimeoutId) {
            clearTimeout(debouncedTimeoutId);
        }

        debouncedTimeoutId = setTimeout(function () {
            callback.apply(null, passedArguments);
        }, callTime - lastCallTime);
    }
}

function EdgesChecker() {
    this.mouseY = null;

    let intervalId = null;

    this.__draggingCounter = null;

    this.useDraggingCounter = function (draggingCounter) {
        this.__draggingCounter = draggingCounter;
    }

    this.isDragging = function () {
        if (!this.__draggingCounter) {
            return false;
        }
        return this.__draggingCounter.isAnyDragging;
    }

    function makeScrollingValueFromDistance(distanceFromEdge) {
        return Math.min(Math.floor(50 / Math.max(1, distanceFromEdge)), 25)
    }

    this.start = function () {
        if (intervalId) {
            return;
        }
        intervalId = setInterval(function () {
            const mouseY = this.mouseY;

            if (!this.isDragging() || mouseY === null) {
                this.stop();
                return;
            }
            const distanceFromTopEdge = mouseY;
            const distanceFromBottomEdge = window.innerHeight - mouseY;
            const isOverTopEdge = distanceFromTopEdge < 50;
            const isOverBottomEdge = distanceFromBottomEdge < 50;

            if (isOverTopEdge) {
                document.body.scrollTop -= makeScrollingValueFromDistance(distanceFromTopEdge);
            } else if (isOverBottomEdge) {
                document.body.scrollTop += makeScrollingValueFromDistance(distanceFromBottomEdge);
            } else {
                this.stop();
            }
        }.bind(this), 20);
    }

    this.stop = function () {
        clearInterval(intervalId);
        intervalId = null;
    }

    this.setMouseY = function (y) {
        this.mouseY = y;
    }
}

function DraggingCounter () {
    this.__countOfDragging = 0;

    this.__handleStartOfDragging = function () {
        this.__countOfDragging += 1;
    }.bind(this);

    this.__handleStopOfDragging = function () {
        this.__countOfDragging -= 1;
    }.bind(this);

    this.attachDraggingTracker = function (draggingTracker) {
        draggingTracker.addHandler('start', this.__handleStartOfDragging);
        draggingTracker.addHandler('stop', this.__handleStopOfDragging);
    }

    this.detachDraggingTracker = function (draggingTracker) {
        draggingTracker.removeHandler('start', this.__handleStartOfDragging);
        draggingTracker.removeHandler('stop', this.__handleStopOfDragging);
    }

    Object.defineProperty(this, 'isAnyDragging', {
        get () {
            return this.__countOfDragging > 0;
        },
    });
}

const DraggableStatic = new function () {
    this.__mousePositionTracker = new MousePositionTracker();
    this.__draggingCounter = new DraggingCounter();
    this.__edgesChecker = new EdgesChecker();
    this.__edgesChecker.useDraggingCounter(this.__draggingCounter);

    this.__handleMouseMove = function(event) {
        this.__edgesChecker.setMouseY(event.clientY);
        this.__edgesChecker.start();

        this.__mousePositionTracker.update(extractMousePositionFromEvent(event));
    };

    this.__lastScrollTop = 0;

    this.__handleBodyScroll = function(event) {
        const scrollTop = document.body.scrollTop;
        if (scrollTop === this.__lastScrollTop) {
            return;
        }

        const deltaY = scrollTop - this.__lastScrollTop;

        this.__lastScrollTop = scrollTop;

        this.__mousePositionTracker.updateWithDelta({
            x: 0,
            y: deltaY,
        });
    };


    this.__handleMouseUp = function(event) {
        this.__mousePositionTracker.stop();
    }

    window.addEventListener('mousemove', this.__handleMouseMove.bind(this));
    window.addEventListener('scroll', this.__handleBodyScroll.bind(this));
    window.addEventListener('mouseup', this.__handleMouseUp.bind(this), true);

    this.attachDraggingTracker = function (draggingTracker) {
        this.__draggingCounter.attachDraggingTracker(draggingTracker);

        draggingTracker.useMousePositionTracker(this.__mousePositionTracker);
    }

    this.getMousePositionDelta = function (field) {
        return this.__mousePositionTracker.getDelta(field);
    }
}

function Draggable (element, options) {
    this.__element = element;

    this.__element.classList.add('no-user-select-at-all');

    this.__draggingTracker = new DraggingTracker({
        isDraggingAllowed: function () {
            return !this.controllerData.isEditable;
        }.bind(this),
    });

    DraggableStatic.attachDraggingTracker(this.__draggingTracker);

    this.__ghostBlock = new GhostBlock();
    this.__ghostBlock.ownsBy(this.__element);

    this.__originalOffsetTop = 0;
    this.__swappedElements = 0;

    setTimeout(function () {
        try {
            this.__element.parentElement.style.position = 'relative';
        } catch (error) {
        }
    }.bind(this), 0);

    this.__handleStartingOfDragging = function () {
        this.__originalOffsetTop = this.__element.offsetTop;
        this.__ghostBlock.mount();
        this.update();
    }.bind(this);

    this.__handleContinueOfDragging = function () {
        this.update();
    }.bind(this);

    this.__handleStoppingOfDragging = function () {
        this.withDragTrigger(preventCapturedClickPropagationOnce);
        if(this.__swappedElements !== 0 && typeof options.moveItemBy === 'function') {
            options.moveItemBy(this.__swappedElements, this.__element, this.controllerData);
        }
        this.__swappedElements = 0;
        this.__ghostBlock.unmount();
        this.__originalOffsetTop = 0;
        this.update();
    }.bind(this);

    this.__limitXPosition = function (deltaX) {
        const min = -30;
        const max = 30;
        return Math.max(min, Math.min(deltaX, max));
    }

    this.__limitYPosition = function (deltaY) {
        const min = -10;
        const max = this.__element.offsetParent.clientHeight - computeHeightByChildren(this.__element) + 10;
        return Math.max(min, Math.min(deltaY, max));
    }

    this.__draggingTracker.addHandler('start', this.__handleStartingOfDragging);
    this.__draggingTracker.addHandler('continue', this.__handleContinueOfDragging);
    this.__draggingTracker.addHandler('stop', this.__handleStoppingOfDragging);

    this.handleMouseDown = function (event) {
        this.__draggingTracker.startToTrackMousePosition(extractMousePositionFromEvent(event));
    }

    this.getDragTrigger = function () {
        return this.__element.querySelector('[data-drag-trigger]');
    };

    this.withDragTrigger = function (callback) {
        const trigger = this.getDragTrigger();

        if (!trigger) {
            return;
        }

        callback(trigger);
    }

    this.withDragTrigger(function (trigger) {
        trigger.addEventListener('mousedown', this.handleMouseDown.bind(this));
    }.bind(this))

    this.stylizeElement = function () {
        const isDragging = this.__draggingTracker.isDragging;

        let translatePoints = [0, 0, 0];

        if (isDragging) {
            const deltaX = DraggableStatic.getMousePositionDelta('x');
            const deltaY = DraggableStatic.getMousePositionDelta('y');
            translatePoints = [
                this.__limitXPosition(deltaX),
                this.__limitYPosition(this.__originalOffsetTop + deltaY),
                99,
            ];
        }
        const element = this.__element;
        element.style.position = isDragging ? 'absolute' : null;
        element.style.top = isDragging ? '0' : '';
        element.style.zIndex = isDragging ? '99' : '';
        element.style.transform = makeTranslate3dCssRule(translatePoints);
    }

    function keepScroll(callback, scrollable) {
        const scrollTopBefore = scrollable.scrollTop;
        callback();
        scrollable.scrollTop = scrollTopBefore;
    }

    this.update = function () {
        if (!this.__element.parentElement) {
            this.destroy();
            return;
        }

        this.stylizeElement();

        if (!this.__draggingTracker.isDragging) {
            return;
        }

        const differenceByY = DraggableStatic.getMousePositionDelta('y');
        const draggingElementOffsetTop = differenceByY + this.__originalOffsetTop;

        const height = computeHeightByChildren(this.__element);

        const nextItem = findFirstSimilarSibling(this.__element, 'next');
        const ghostElement = this.__ghostBlock.element;
        const previousItem = findFirstSimilarSibling(this.__element, 'previous');

        const isOverNextItem = nextItem
          && (draggingElementOffsetTop + height) > nextItem.offsetTop + (computeHeightByChildren(nextItem) * 0.95);
        const isOverPreviousItem = previousItem
          && (draggingElementOffsetTop) < previousItem.offsetTop + (computeHeightByChildren(previousItem) * 0.05);

        if (isOverNextItem) {
            keepScroll(function () {
                (ghostElement || this.__element).before(nextItem);
            }.bind(this), document.body);
            this.__swappedElements += 1;
        } else if (isOverPreviousItem) {
            keepScroll(function () {
                this.__element.after(previousItem);
            }.bind(this), document.body);
            this.__swappedElements -= 1;
        }
    };

    this.destroy = function () {
        this.__draggingTracker.removeHandler('start', this.__handleStartingOfDragging);
        this.__draggingTracker.removeHandler('continue', this.__handleContinueOfDragging);
        this.__draggingTracker.removeHandler('stop', this.__handleStoppingOfDragging);
    }
}


function moveItem(list, from, by) {
    const to = Math.max(0, Math.min(from + by, list.length - 1));
    const resultList = [];

    for (let targetIndex = 0, sourceIndex = 0; targetIndex < list.length; ++targetIndex) {
        if (sourceIndex === from) {
            ++sourceIndex;
        }
        if (targetIndex === to) {
            resultList[targetIndex] = list[from];
            continue;
        }
        resultList[targetIndex] = list[sourceIndex];
        ++sourceIndex;
    }

    return resultList;
}

function moveItemByMutable(currentIndex, indexDifference, items) {
    const removedItems = items.splice(currentIndex, 1);
    const itemToMove = removedItems[0];
    const nextIndex = currentIndex + indexDifference;
    items.splice(nextIndex, 0, itemToMove);
}

function returnElementOnInitialPosition(element, indexDifference) {
    const step = indexDifference > 0 ? -1 : 1;
    let sibling = element;
    for (let i = indexDifference; i !== 0; i += step) {
        sibling = sibling[`${indexDifference > 0 ? 'previous' : 'next'}ElementSibling`];
    }
    const insertionMethod = indexDifference > 0 ? 'before' : 'after';
    sibling[insertionMethod](element);
}

function baseMoveItemBy() {
    return function (indexDifference, element, controllerData) {
        const items = RoutingHelper.findList(controllerData.item);
        const currentItem = controllerData.item;
        const currentIndex = items.indexOf(currentItem);


        setTimeout(function() {
            returnElementOnInitialPosition(element, indexDifference);
            moveItemByMutable(currentIndex, indexDifference, items);
        });
        somethingWasChanged();
        RoutingHelper.routingChanged();
    }
}

function getProperty(object, property) {
    const path = property.split('.');

    let value = object;

    path.forEach(function (pathPart) {
        value = value[pathPart];
    });

    return value;
}

function integrateModules(self, modules, mapping) {
    modules.forEach(function (module) {
        Object.defineProperty(module, 'controllerData', {
            get() {
                return {
                    item: getProperty(self, mapping.item),
                    items: getProperty(self, mapping.items),
                    isEditable: mapping.isEditable ? getProperty(self, mapping.isEditable) : null,
                };
            },
        });
    });
}

rivets.components['rule-block'] = {
    template: function(){
        var tgl_id = RoutingHelper.getToggleId();
        return '<div class="_rule-entry" rv-class-_minimized="rule.minimized" rv-class-_last-path="isLast | call rule rules" data-s="rule-container">\
                    <div data-drag-trigger class="_path _active path-header-block" rv-class-_paused="isPaused | call rule.status">\
                        <div class="_div-color"></div>\
                        <div class="_list-collapser" rv-on-click="minimizeAction" rv-class-_closed-collapser="rule.minimized" data-s="minimize-button"><div class="_collapser-button"></div></div>\
                        <div class="_caption-block _caption _renamed_caption" rv-on-click="state.changeEditable">\
                            <span rv-text="rule.name" rv-class-hidden="state.hideSpanState | call state.editable" ></span>\
                            <input class="rule_caption_input" rv-value="rule.name" rv-class-hidden="state.hideInputState | call state.editable" rv-on-blur="state.changeEditable"></input>\
                            </div>\
                        <div class="_weight-wrapper _rule_weight">\
                            <span class="_get_rule_up" rv-on-click="getUp"><img src="templates/standart/images/up_3.png" ></span>\
                            <span class="_get_rule_down" rv-on-click="getDown"><img src="templates/standart/images/down_3.png" ></span>\
                        </div>\
                        <div class="_of-actions" data-object-type="offer">\
                            <div style="display:inline">\
                                <input rv-on-click="changeStatus" id="'+tgl_id+'" type="checkbox" rv-checked="rule.active" class="tgl tgl-light">\
                                <label for="'+tgl_id+'" class="tgl-btn" style="top:0"></label>\
                            </div>\
                            <div style="line-height:30px;display:inline;">\
                                <div rv-on-click="copy" class="rule_copy_btn" style="display:inline-block"></div>\
                            </div>\
                            <div rv-on-click="delete" class="delete_btn"></div>\
                        </div>\
                    </div>\
                    <div class="_block_in_rule-entry" rv-class-_hidden-block="rule.minimized" data-s="rule-content-container">\
                        <criteria-block criteria="rule.criteria"></criteria-block>\
                        <rule-paths-block paths="rule.paths"></rule-paths-block>\
                        <paths-buttons paths="rule.paths"></paths-buttons>\
                    </div>\
                </div>';
    },

    initialize: function(el, data){
        return new ruleController(data, [
            new Draggable(el, {
                moveItemBy: baseMoveItemBy(),
            }),
        ]);
    }
};
function ruleController(data, modules){
    this.rule = data.rule;
    this.rules = data.rules;

    integrateModules(this, modules, {
        item: 'rule',
        items: 'rules',
        isEditable: 'state.editable',
    });

    this.isVisible = function (isHidden) {
        return !isHidden
    }

    this.isLast = function(rule, rules){
        if (rules.indexOf(rule) == (rules.length-1) ){
            return true;
        } else {
            return false;
        }
    };

    this.copy = function( event, scope ){
        var rule = JSON.parse(JSON.stringify(scope.rule));
        var clearedRule = RoutingHelper.clearRule(rule);
        RoutingHelper.copyRule( clearedRule );
        $(".paste_rules_templates").css({"display" : "inline-block"});
        $(".paste_rules_templates div:nth-child(2)").text('Paste rule');
        $(".clear_rules_templates").css({"display" : "inline-block"});
    },

      this.delete = function(event, scope){
          somethingWasChanged();
          RoutingHelper.routingChanged();
          RoutingHelper.removeRule(scope.rule);
      };

    this.rule.number = (data.rules.indexOf(data.rule)+1);
    this.rule.paused = (data.rule.status==0?true:false);
    this.rule.active = (data.rule.status==0?false:true);

    this.isPaused = function(status){
        return (status==0?true:false);
    };

    this.getUp = function(event, scope){

        somethingWasChanged();
        RoutingHelper.routingChanged();


        if (scope.rules.length==1){return;}

        if (scope.rules.indexOf(scope.rule)>0){

            var rule_index = scope.rules.indexOf(scope.rule);
            if (rule_index == 0 || rule_index==-1){
                return false;
            }
            scope.rule.number = parseInt(scope.rule.number) - 1;
            scope.rules[rule_index-1].number = parseInt(scope.rules[rule_index-1].number) + 1;

            scope.rules.sort(function(x,y){
                if (x.number > y.number){
                    return 1;
                }
                if ( x.number < y.number){
                    return -1;
                }
                return 0;
            });


        } else {
            return;
        }

        for (var j=0, jl=scope.rules.length;j<jl;j++){
            // simulate change object for path.isLast recounting
            for (var i=0, l=scope.rules[j].paths.length;i<l;i++){

                scope.rules[j].paths[i].minimized = !!scope.rules[j].paths[i].minimized;

            }
        }

    };
    this.getDown = function(event, scope) {

        somethingWasChanged();
        RoutingHelper.routingChanged();

        var rule_index = scope.rules.indexOf(scope.rule);
        if (rule_index == scope.rules.length-1 || rule_index==-1){
            return false;
        }
        scope.rule.number = parseInt(scope.rule.number) + 1;
        scope.rules[rule_index+1].number = parseInt(scope.rules[rule_index+1].number) - 1;

        scope.rules.sort(function(x,y){
            if (x.number > y.number){
                return 1;
            }
            if ( x.number< y.number){
                return -1;
            }
            return 0;
        });

        // simulate change object for path.isLast recounting
        for (var j=0, jl=scope.rules.length;j<jl;j++){
            // simulate change object for path.isLast recounting
            for (var i=0, l=scope.rules[j].paths.length;i<l;i++){
                scope.rules[j].paths[i].minimized = !!scope.rules[j].paths[i].minimized;
            }
        }

    }

    this.changeStatus = function(event, scope){

        somethingWasChanged();
        RoutingHelper.routingChanged();

        var status;
        if ($(event.target).prop("checked")==true){
            status = 1;
            var collapser = $(event.target).parent().parent().find("._list-collapser");
            if (collapser.hasClass("_closed-collapser")){
                collapser.trigger("click");
            }
        } else {
            status = 0;
            var collapser = $(event.target).parent().parent().find("._list-collapser");
            if (!collapser.hasClass("_closed-collapser")){
                collapser.trigger("click");
            }

        }
        scope.rule.status = status;
        scope.rule.paused = (status==0?true:false);
        scope.rule.active = (status==0?false:true);
    }

    this.rule.button_state = {};
    this.rule.button_state.not_paused = (function(rule){
        if (rule.status==0){
            return false;
        } else {
            return true;
        }

    })(this.rule);

    this.state = {};

    this.rule.minimized = (this.rule.status==0 || window.ROUTING_UTIL_STORAGE.isRuleMinimized(this.rule.id)?true:false);
    this.state.editable == false;
    this.state.hideInputState = function(editable){
        return !editable;
    }
    this.state.hideSpanState = function(editable){
        return editable;
    }
    this.state.inputBlur = function(event, scope){
        if (scope.state.editable==true){
            scope.state.editable = false;
        }
    }
    this.minimizeAction = function(event, scope){
        scope.rule.minimized = !scope.rule.minimized;
        if (scope.rule.id) {
            if (scope.rule.minimized) {
                window.ROUTING_UTIL_STORAGE.writeMinimizedRule(scope.rule.id, true);
            } else {
                window.ROUTING_UTIL_STORAGE.writeMinimizedRule(scope.rule.id, false);
            }
        }

    }
    this.rule.edit = function(obj, state){
        state.editable = true;
        $(".rule_caption_input:not(.hidden)")[0].focus();
    }

    this.state.changeEditable = function(event, scope){

        if (event.type=="click" && event.target.tagName.toLowerCase()=="input" && scope.state.editable==true){
            return;
        }

        if (event.type=='blur') {
            scope.state.editable = false;
            return;
        }

        scope.state.editable = !scope.state.editable;

        if ( scope.state.editable ){
            if ($(event.target).find("input").length>0){
                $(event.target).find("input")[0].focus();
            } else if (event.target.tagName.toLowerCase() == "span") {
                $(event.target).next()[0].focus();
                event.target.focus();
            }
        }

    }
};

rivets.components['rules-buttons'] = {
    template: function(){
        return '<div class="_rule_buttons_wrapper"><a rv-on-click="addRule" class="green-button" id="add-rule-btn" data-s="add-rule-btn"><img src="templates/standart/images/w-add.png" class="icon add_icon">Rule</a></div>';
    },
    initialize: function(el, data){
        return new rulesButtonsController(data);
    }
};
function rulesButtonsController(data) {
    this.rules = data.rules;
    this.addRule = function(event, scope){
        // TODO добавить доп коллбек на сохранение
        WindowsHelper.addCriterion("new_rule", scope.rules);
    }
};

rivets.components['criteria-block'] = {

    template: function(){
        return '<div class="_criteria _inner-block">\
                    <div class="_criteria_header">\
                        <div class="_criteria_header_caption _caption-block _caption"><span style="color:#11AA22;">CRITERIA</span></div>\
                    </div>\
                    <div class="_criteria_blocks_wrapper">\
                        <div><criterion-block rv-each-criterion="criteria" criterion="criterion" criteria="criteria"></criterion-block></div>\
                        <criteria-buttons  criteria="criteria"><criteria-buttons>\
                    </div>\
                </div>';
    },
    initialize: function(el, data){return data;}

};


rivets.components['criterion-block'] = {
    template: function(){
        return '<div data-drag-trigger class="_row _active _criterion" rv-class-_paused="criterion.paused" data-s="criterion-block">\
                    <div class="_div-color"></div>\
                    <div class="_criterion_caption _lp-caption _caption" rv-on-click="criterion.rowEdit">\
                        <span>{getCriterionName | call criterion.type criterion.type2}</span>\
                        <span rv-html="getValueString | call criterion.type criterion.type2 criterion.values"></span>\
                    </div>\
                    <actions-block obj="criterion" array_holder="criteria"></actions-block>\
                </div>';
    },
    initialize: function(el, data){
        return new criterionController(data);
    },
};

function criterionController(data){
    this.criterion = data.criterion;
    this.criteria = data.criteria;
    this.criterion.paused = (this.criterion.status==0?true:false);

    this.getCriterionName = function(cri_type, cri_type_2){

        var criterion_map = {
            "1":"Brand and Model",
            "2":"Browser and version",
            "3":"Operating system and version",
            "14":"Language",
            "17":"Device type",
            "16":"Device resolution",
            "4":"Country",
            "20":"City",
            "24":"State / Province",
            "19":"GET",
            "5":"ISP",
            "13":"Connection type",
            "6":"IP",
            "23":"IP version",
            "7":"User agent",
            "12":"Day of week",
            "18":"Part of day",
            "11":"Referer",
            "8":"Unique/Non-unique",
            "9":"Proxy-traffic",
            "25":"Crawler",
            "21":"URL",
            "22":"Traffic Source",
            "26": 'Bot',
            "27": 'Headers',
        }

        if (typeof criterion_map[cri_type] == "undefined" && cri_type!=0){
            if (ROUTING.tokens){
                var tokenIndex, token = {};
                if ( BINOM.__page=='add_camp' || BINOM.__page=='edit_camp' || BINOM.__page=='clone_camp' ){

                    if ( $("#rotation_input").val() == 0 ){
                        // Typical campaigns token
                        tokenIndex = cri_type - 90;


                        token = ROUTING.tokens.findObjectByProp("id", tokenIndex);
                    } else if ( $("#rotation_input").val()>0 ){
                        // Need to prepare from flow-tokens
                        tokenIndex = cri_type-81;
                        token = ROUTING.tokens[ tokenIndex ];
                    }

                } else if( BINOM.__page == 'add_rotation' ) {
                    tokenIndex = cri_type;
                    token = ROUTING.tokens.findObjectByProp("id", tokenIndex);
                }
                if ( token!==false && typeof token != "undefined" ){
                    return "Token " + (token.type) + ": "+ token.name;
                } else {
                    return "#UNDEFINED TOKEN#";
                }
            } else {
                return "#UNDEFINED TOKEN#: ";
            }
        } else if (cri_type==8) {
            if (cri_type_2==0){
                return "Unique";
            } else {
                return "Not Unique";
            }
        } else if (cri_type==23) {
            if (cri_type_2==0){
                return "IPv4";
            } else if (cri_type_2==1) {
                return "IPv6";
            }
        } else {
            return criterion_map[cri_type];
        }


    }

    this.getValueString = function(type, type2, values){

        var operator_string = "", values_string = "";

        if (type2 == 1){
            operator_string += " <span class='red_text'>IS NOT</span> ";
        } else {
            operator_string += " <span class='green_text'>IS</span> ";
        }

        if ( (type==11 || type>90 || type==14) && values.length==1 && values[0].toLowerCase()=="unknown"){
            values_string = "Empty/Unknown";
        } else {

            // Splice causes an error Maximum call stack size
            var temp_values = new Array();
            for (var i=0;i<10;i++){
                if (typeof values[i] != "undefined"){
                    temp_values[i] = values[i];
                }
            }

            if (type==8){
                if (values[0]==1){
                    operator_string =" in ";
                    values_string=" all traffic"
                } else {
                    operator_string = " in ";
                    values_string = " this campaign";
                }
            } else if (type==23) {
                operator_string = '';
                values_string = '';
            } else {
                //var temp_values = new Array();

                // make unknown value italic
                if (type==11 || type>90 || type==14) {
                    var unknown_index = temp_values.indexOf("unknown");
                    if (unknown_index!=-1) {
                        temp_values[unknown_index] = "<i>unknown</i>";
                    }
                } else if (type==12) {
                    var days_map = {
                        "1":"Monday",
                        "2":"Tuesday",
                        "3":"Wednesday",
                        "4":"Thursday",
                        "5":"Friday",
                        "6":"Saturday",
                        "7":"Sunday"
                    }
                    for (var i=0; i<temp_values.length;i++){
                        temp_values[i] = days_map[temp_values[i]];
                    }

                } else if ( type==22  ){

                    temp_values = temp_values.map(function( item ){
                        return item.name;
                    });

                } else if (type == 27) {
                    temp_values = temp_values.map(function( item ){
                        return item.name + ': ' + item.value;
                    });
                    // temp_values = ['name: val', 'name2: val2'];
                }



                values_string = temp_values.join(", ")
                /*if (values.length>5){
                    values_string += "...";
                }*/
            }

        }
        end_string=operator_string+values_string;
        return end_string;
    };

    this.criterion.rowEdit = function(event, scope){
        if ( (BINOM.__page == "add_camp" || BINOM.__page == "edit_camp" ) && scope.criterion.type == 22 ){
            return;
        }
        var editCriterionOptions = {};
        // mean rotation token and will not editing
        if ( BINOM.__pageType == "add_camp" || BINOM.__pageType == "edit_camp" ){
            if ( scope.criterion.type > 80 && scope.criterion.type < 91 ){
                var numberOfSavedToken = scope.criterion.type-81;
                var currentCampaignTokenType = 90 + parseInt( ROUTING.tokens[numberOfSavedToken].id );
                editCriterionOptions.tempType = currentCampaignTokenType;
            }
        }
        WindowsHelper.editCriterion(scope.criterion, editCriterionOptions);

    },

      this.criterion.edit = function(obj){
          WindowsHelper.editCriterion(obj);
      };

};

rivets.components['criteria-buttons'] = {
    template: function(){
        return '<div class="_criteria_buttons_wrapper"><a rv-on-click="addCriterion" class="green-button" id="add-cri-btn" data-s="add-criterion-btn"><img src="templates/standart/images/w-add.png" class="icon add_icon">Criteria</a></div>';
    },
    initialize: function(el, data){
        return new criterionButtonController(data);
    }
};
function criterionButtonController(data){

    this.criteria = data.criteria;

    this.addCriterion = function(event,scope){
        WindowsHelper.addCriterion(scope.criteria);
    };
}

// Убрать Weight Actions отсюда
// Path components
rivets.components['paths-block'] = {
    // Return the template for the component.
    template: function() {
        return '<div class="_paths" data-s="paths-block">\
                  <div class="_paths_header" rv-class-empty-routing-block-header="isEmpty | call paths" >\
                      <div class="_list-collapser" rv-on-click="minimizeAction" rv-class-_closed-collapser="state.minimized"><div class="_collapser-button"></div></div>\
                      <div class="_caption-block"><span>PATHS</span></div>\
                      <div class="_path-weight"><span>Weight</span></div>\
                      <div class="_path-actions"><span>Actions</span></div>\
                  </div>\
                  <div><path-block class="_path_block" rv-each-path="paths" path="path" paths="paths"></path-block></div>\
              <div>';
    },

    initialize: function(el, data) {
        return new pathsBlockController(data);
    }
};
function pathsBlockController(data) {
    this.paths = data.paths;
    this.state = {};
    this.state.minimized = false;

    this.isEmpty = function(paths){
        if (paths.length==0){ return true }
        else {return false;}
    };

    this.minimizeAction = function(event, scope){
        scope.state.minimized = !scope.state.minimized;
        if (scope.state.minimized==true){
            for (var i=0;i<scope.paths.length;i++){
                scope.paths[i].minimized = true;
            }
        } else {
            for (var i=0;i<scope.paths.length;i++){
                if (scope.paths[i].status!=0){
                    scope.paths[i].minimized = false;
                }
            }
        }

    };
};

rivets.components['rule-paths-block'] = {
    // Return the template for the component.
    template: function() {
        //return "<path-block rv-each-path='ROUTING.paths' style='border: 1px solid blue;'> <h3>{path.name}</h3> </path-block>";
        return '<div class="_paths" data-s="rule-paths-block">\
                  <div class="_paths_header" rv-class-empty-routing-block-header="isEmpty | call paths">\
                      <div class="_list-collapser" rv-on-click="minimizeAction" rv-class-_closed-collapser="state.minimized"><div class="_collapser-button"></div></div>\
                      <div class="_caption-block"><span>PATHS</span></div>\
                  </div>\
                  <div ><path-block rv-each-path="paths" class="_path-block" path="path" paths="paths"></path-block><div>\
              </div>';
    },

    initialize: function(el, data) {
        return new rulePathsController(data);
    }
};
function rulePathsController(data){
    this.paths = data.paths;
    this.isEmpty = function(paths){
        if (paths.length==0){ return true }
        else {return false;}
    };
    this.state = {};
    this.state.minimized = false;
    this.minimizeAction = function(event, scope){
        scope.state.minimized = !scope.state.minimized;

        if (scope.state.minimized==true){
            for (var i=0;i<scope.paths.length;i++){
                scope.paths[i].minimized = true;
            }
        } else {
            for (var i=0;i<scope.paths.length;i++){
                if (scope.paths[i].status!=0){
                    scope.paths[i].minimized = false;
                }
            }
        }

    };
}

rivets.components['path-block'] = {

    template: function() {
        var tgl_id = RoutingHelper.getToggleId();
        return '<div class="_path-entry path-block" data-s="path-block" rv-class-_minimized="path.minimized" rv-class-_last-path="isLast | call path paths" rv-class-_paused="isPaused | call path.status">\
                <div data-drag-trigger class="_path _active path-header-block">\
                    <div class="_div-color"></div>\
                    <div class="_list-collapser" rv-on-dblclick="cancelSelect" rv-on-click="minimizeAction" rv-class-_closed-collapser="path.minimized"><div class="_collapser-button"></div></div>\
                    <div class="_caption-block _path_caption _caption _renamed_caption" rv-on-click="state.changeEditable">\
                        <span rv-class-hidden="state.hideSpanState | call state.editable" rv-text="path.name"></span>\
                        <input class="path_caption_input" rv-value="path.name" rv-on-blur="state.changeEditable" rv-class-hidden="state.hideInputState | call state.editable">\
                    </div>\
                    <weight-block object="path"></weight-block>\
                    <div class="_of-actions" data-object-type="offer">\
                        <div style="display: inline;">\
                            <input rv-on-click="changeStatus" id="'+tgl_id+'" type="checkbox" rv-checked="path.button_state.not_paused" class="tgl tgl-light">\
                            <label for="'+tgl_id+'" style="top: 0;" class="tgl-btn"></label>\
                        </div>\
                        <div style="line-height:30px;display:inline;">\
                            <div rv-on-click="copy" class="rule_copy_btn" style="display:inline-block"></div>\
                        </div>\
                        <div rv-on-click="delete" " class="delete_btn"></div>\
                    </div>\
                </div>\
                <div rv-class-_hidden-block="path.minimized">\
                    <landings-block landings="path.landings" offers="path.offers"></landings-block>\
                    <offers-block offers="path.offers" landings="path.landings"></offers-block>\
                </div>\
            </div>';
    },

    initialize: function(el, data) {
        return new pathController(data, [
            new Draggable(el, {
                moveItemBy: baseMoveItemBy(),
            }),
        ]);
    },
};

function defineGetSet(obj, name, initial) {
    obj[`__${name}`] = initial;
    console.log(`initialize ${name} with ${initial}`, obj);

    Object.defineProperty(obj, name, {
        get() {
            return obj[`__${name}`];
        },
        set(value) {
            console.log(`set ${name} with ${value}`, obj);
            obj[`__${name}`] = value;
        }
    })
}

function pathController(data, modules){
    this.path  = data.path;
    this.paths = data.paths;
    this.del = data.del;

    this.isVisible = function (isHidden) {
        return !isHidden
    }

    integrateModules(this, modules, {
        item: 'path',
        items: 'paths',
        isEditable: 'state.editable',
    });

    this.path.paused = (data.path.status==0?true:false);

    this.isLast = function(path, paths){

        if ( paths.indexOf(path) == (paths.length-1) ){
            return true;
        } else {
            return false;
        }

    }

    this.state = {};
    this.path.minimized = (function(){
        if (data.path.minimized){
            return data.path.minimized;
        } else {
            return (data.path.status==0?true:false);
        }
    }());

    this.state.editable == false;

    this.isPaused = function(status){ return (status==0?true:false); }

    this.delete = function(event, scope, ...rest){
        RoutingHelper.routingChanged();
        RoutingHelper.removePath(scope.path);
        somethingWasChanged();
    }

    this.copy = function(event, scope) {
        var path = JSON.parse(JSON.stringify(scope.path));
        var clearedPath = RoutingHelper.clearPath(path);
        RoutingHelper.copyPath( clearedPath );
    }

    this.minimizeAction = function(event, scope){
        scope.path.minimized = !scope.path.minimized;
    }

    this.changeStatus = function(event, scope){
        RoutingHelper.routingChanged();
        var status;
        if ($(event.target).prop("checked")==true){
            status = 1;
            var collapser = $(event.target).parent().parent().find("._list-collapser");
            if (collapser.hasClass("_closed-collapser")){
                collapser.trigger("click");
            }
        } else {
            status = 0;
            var collapser = $(event.target).parent().parent().find("._list-collapser");
            if (!collapser.hasClass("_closed-collapser")){
                collapser.trigger("click");
            }

        }
        scope.path.status = status;
    }

    this.path.button_state = {};
    this.path.button_state.not_paused = (function(path){
        if (path.status==0){
            return false;
        } else {
            return true;
        }

    })(this.path);

    this.state.hideInputState = function(editable){
        return !editable;
    }
    this.state.hideSpanState = function(editable){
        return editable;
    }

    this.path.edit = function(obj, state){
        state.editable = true;
        $(".path_caption_input:not(.hidden)")[0].focus();
        RoutingHelper.routingChanged();
    }

    // All this move with bluredByKeybeaord
    // exist coz after keyboard event and closing
    this.state.bluredByKeyboard = false;
    this.state.changeEditable = function(event, scope){
        RoutingHelper.routingChanged();

        if (event.type=="click" && event.target.tagName.toLowerCase()=="input" && scope.state.editable==true){
            return;
        }

        if (event.type=='blur' && scope.state.bluredByKeyboard) {
            scope.state.bluredByKeyboard = false;
            return;
        } else if (event.type=='blur') {
            scope.state.editable = false;
            return;
        }

        scope.state.editable = !scope.state.editable;

        if ( scope.state.editable ){
            if ($(event.target).find("input").length>0){
                $(event.target).find("input")[0].focus();
            } else if (event.target.tagName.toLowerCase() == "span") {
                $(event.target).next()[0].focus();
                event.target.focus();
            }
        }

    }
};

rivets.components['paths-buttons'] = {
    template: function(){
        return `
          <div class="_path_buttons_wrapper">
              <a rv-on-click="addPath" class="green-button" id="add-path-btn">
                  <img src="templates/standart/images/w-add.png" class="icon add_icon">
                  Path
              </a>
              <a rv-on-click="pastePath" class="green-button paste-path-btn" style="display: none">
                  <img src="templates/standart/images/w-add.png" class="icon add_icon">
                  <span>Paste path</span>
              </a>
              <a rv-on-click="clearPathsBuffer" class="gray-button clear-paths-buffer-btn" style="display: none">
                  <img src="templates/standart/images/b-clear2.png" class="icon add_icon">
                  Clear buffer
              </a>
          </div>
        `;
    },
    initialize: function(el, data){
        return new pathsButtonsController(data);
    }
};
function pathsButtonsController(data){
    this.paths = data.paths;
    this.addPath = function(event, scope){
        scope.paths.push(RoutingHelper.makeEmptyPath(scope.paths));
    }
    this.pastePath = function(event, scope){
        RoutingHelper.pasteCopiedPath(function () {
            return scope.paths;
        }, function (paths) {
            scope.paths = paths
        });
    }
    this.clearPathsBuffer = function(event, scope){
        RoutingHelper.clearCopiedPath();
    }
};

// Landing components
rivets.components['landings-block'] = {
    template: function(){
        return '<div class="_landers" >\
                    <div class="lands-block">\
                        <div class="_lp_header">\
                            <div class="_lp-caption"><span>LANDING PAGES</span></div>\
                        </div>\
                        <div><landing-block rv-each-landing="landings" offers="offers" landings="landings" landing="landing"></landing-block></div>\
                    </div>\
                     <landing-buttons landings="landings" offers="offers"></landing-buttons>   \
                <div>';
    },
    initialize: function(el, data) {
        return data;
    }
};


rivets.components['landing-block'] = {
    template: function(){
        var tgl_id = RoutingHelper.getToggleId();
        return '<div data-drag-trigger class="_lp _row" rv-class-_paused="landing.paused" data-landing-id={landing.id} >\
                        <div class="_div-color"></div>\
                        <div class="_lp-caption _caption" rv-on-click="changeLanding">\
                            <span class="_lp-name-span" rv-class-routing-lp-banned="isBanned | call landing.detail.is_banned">\
                                { getLandingName | call landing.detail.name }\
                                <span class="_lp-offers-count" title="Count of offers" rv-text="landingOffersFormat | call landing landing.detail.offers"></span>\
                                <div rv-if="isBanned | call landing.detail.is_banned" class="_lp-banned-icon"></div>\
                            </span>\
                            <span rv-if="hasLang | call landing.detail.lang" class="_info" title="Landing\'s lang">{landing.detail.lang | lowerCase}</span>\
                        </div>\
                        <weight-block object="landing"></weight-block>\
                        <actions-block obj="landing" array_holder="landings" offers="offers" landings="landings"></actions-block>\
                    </div>';
    },
    initialize: function(el, data) {
        return new landingController(data, [
            new Draggable(el, {
                moveItemBy: baseMoveItemBy(),
            })
        ]);
    }
};
function landingController(data, modules){
    this.landing = data.landing;

    integrateModules(this, modules, {
        item: 'landing',
        items: 'landings',
    });

    this.landing.multioffer = function(landing){
        if (landing.detail.offers>1){
            return true;
        } else {
            return false;
        }
    };
    this.getLandingName = function(name){
        return name;
    };
    // For class in componen flag only
    this.landing.paused = (data.landing.status==0?true:false);

    // For outer calling
    this.landing.edit = function(land){

        if (land.type==1){

            $.ajax({
                type: "post",
                url: "",
                data: {
                    "ajax":1,
                    "type":"get_land",
                    "id":land.id_t,
                }
            }).success(function(data){
                data = JSON.parse(data);
                WindowsHelper.openLandingWindow(data, land);
            });
        }

    };

    this.isMultioffer = function(offers){
        if (typeof offers != 'undefined' && offers>1) return true;
        else return false;
    }

    this.landingOffersFormat = function(landing, offers){
        var result = '';
        if (landing.detail && landing.detail.offers && landing.detail.offers>1){
            result = '('+landing.detail.offers+' offers)';
        }
        return result;
    }

    this.changeLanding = function(event, scope){

        WindowsHelper.chooseLanding(scope.landings, scope.offers, true, scope.landing);
    },
      this.hasLang = function (lang){
          if (typeof lang != "undefined" && lang != "" && lang!="0"){
              return true;
          } else {
              return false;
          }
      }

    this.isBanned = function(is_banned){
        return is_banned=="1";
    }

    this.landings = data.landings;
    this.offers = data.offers;
    this.delete = function(event, scope){
        RoutingHelper.removeLanding(scope.landing);
        somethingWasChanged();
        RoutingHelper.routingChanged();
    };
};

rivets.components['landing-buttons'] = {
    template: function(){
        return '<div class="_lp-buttons">\
                    <a class="green-button add-lander-normal-button" rv-on-click="chooseLanding"><img src="./templates/standart/images/w-add.png" class="icon add_icon">Lander</a>\
                    <a rv-on-click="addDirect" class="green-button add-lander-direct-button"><img src="./templates/standart/images/w-add.png" class="icon add_icon">Direct</a>\
                    <a class="blue-button add-lander-new-button" rv-on-click="addNewLanding"><img src="./templates/standart/images/w-star.png" class="icon new_icon">New lander</a>\
                </div>'
    },
    initialize: function(el, data){
        return new landingButtonsController(data);
    }
};
function landingButtonsController(data){
    this.landings  = data.landings;
    this.offers    = data.offers;
    this.addDirect = function(event, scope){
        somethingWasChanged();
        RoutingHelper.routingChanged();

        var direct_object = {
            "id_t": 0,
            "type" : '2',
            "split" : "100",
            "status":1,
            "detail":{
                "name":"DIRECT",
                "offers":"1",
            }
        }
        scope.landings.push(direct_object);
    };
    this.addNewLanding = function(event, scope){
        WindowsHelper.addNewLanding(scope.landings);
    };
    this.chooseLanding = function(event, scope){
        WindowsHelper.chooseLanding(scope.landings, scope.offers);
    }
};

// Offer components
rivets.components['offers-block'] = {
    template: function(){
        return '<div class="_offers" rv-class-_offers_enumerable="landings | includesMultiofferLanding" >\
                    <div class="_of-header">\
                        <div class="_of-caption"><span>OFFERS</span></div>\
                    </div>\
                    <div><offer-block rv-each-offer="offers" offers="offers" offer="offer"></offer-block></div>\
                    <offer-buttons offers="offers"></offer-buttons>\
                    \
            <div>';
    },
    initialize: function(el,data){
        return new offersController(data);
    }
};
function offersController(data){
    this.offers = data.offers;
    this.landings = data.landings;
}

rivets.components['offer-block'] = {
    template: function(){
        var tgl_id = RoutingHelper.getToggleId();
        return '<div data-drag-trigger class="_of _row _active" rv-class-_paused="isPaused | call offer.status" data-offer-id={offer.id}>\
                    <div class="_div-color"></div>\
                    <div class="_of-caption _caption" rv-title="getOfferName | call offer.detail.name offer.detail.network_name offer.detail.url" rv-on-click="changeOffer">\
                        <div class="_of-caption-flex-wrapper">\
                            <span class="_of-name-span" rv-class-hidden="state.editable" rv-html="getOfferName | call offer.detail.name offer.detail.network_name offer.detail.url offer.detail.geo offer.is_camp" >\
                            </span>\
                            <input rv-on-change="handlingOfferInputChange" rv-on-input="handlingOfferInputChange" class="_offer_direct_url" rv-class-showed="state.editable" type="text" rv-value="offer.detail.url" rv-on-blur="inputLoseFocus">\
                            <span\
                                class="_info"\
                                rv-if="offerCapIsEnabled | call offer.detail.cap_status offer"\
                                rv-html="getOfferCapHTML | call offer.detail.cap_status offer.detail.cap offer.detail.cap_cnv offer offer.id_t"\
                            >\
                            </span>\
                            <span class="_info" rv-text="state.payoutFormat | call offer.detail.payout offer.detail.payout_auto offer offer.id_t offer.detail.currency"></span>\
                        </div>\
                    </div>\
                    <weight-block object="offer"></weight-block>\
                    <input  rv-on-click="changeStatus" id="'+tgl_id+'" type="checkbox" rv-checked="offer.button_state.not_paused" class="tgl tgl-light">\
                    <label for="'+tgl_id+'" class="tgl-btn"></label>\
                    <edit-action-button offers="offers" landings="landings" obj="offer" state="state"></edit-action-button>\
                    <div rv-on-click="delete" class="delete_btn"></div>\
                </div>';
    },
    initialize: function(el,data){
        // TODO добавить листенер на esc и enter для инпута с сылкой оффера
        return new offerController(data, [
            new Draggable(el, {
                moveItemBy: baseMoveItemBy(),
            }),
        ]);
    }
};
function offerController(data, modules){
    this.offer = data.offer;
    this.offer.is_camp = (data.offer.type==5);
    this.offer.paused = (data.offer.status==0?true:false);
    this.offers = data.offers;

    integrateModules(this, modules, {
        item: 'offer',
        items: 'offers',
        isEditable: 'state.editable',
    });

    this.state = {};

    this.isPaused = function(status){ return (status==0?true:false) }

    this.state.editable = ((this.offer.type==4 && this.offer.detail.name=="")?true:false);
    this.state.bluredByKeybeaord = false;
    this.state.focus_flag = false;

    this.offer.button_state = {};
    // I dont understand why just rv-checked="obj.paused" does not wokring it seems like a bug
    this.offer.button_state.not_paused = (function(offer){
        if (offer.status==0){
            return false;
        } else {
            return true;
        }
    })(this.offer);

    this.offerCapIsEnabled = function(cap_status){
        if (!cap_status) cap_status = 0;
        return cap_status=="1";
    }

    this.getOfferName = function(offer_name, network_name, url, geo, is_camp){
        var result = '';
        if (typeof network_name != "undefined" && network_name != "0" && network_name!=""){
            result = network_name + " - " + offer_name;
        } else if (typeof url != 'undefined') {
            result = url;
        } else {
            result = offer_name;
        }
        if (typeof geo != 'undefined' && geo!=0 && geo!=''){
            if (geo=="1") geo = "Global"
            result += ' <span class="_of-geo-span">('+geo+')</span>';
        }
        if (is_camp){
            result += ' (campaign)';
        }
        return result;
    },

      this.getOfferCapHTML = function(cap_status, cap, cap_cnv){
          if (!cap_status) cap_status == "0";
          if (!cap) cap = "0"
          if (!cap_cnv) cap_cnv = "0";
          if (cap_status=="1"){
              return cap_cnv+"/"+cap;
          } else {
              return "";
          }

      }

    this.getOfferNameClear = function(offer_name){
        return $("<div/>").html(offer_name).text();
    },

      this.state.payoutFormat = function(payout, payout_auto, offer, id_t, currency){
          var result = '';
          if (offer.type==5){
              result = "id:"+id_t;
          }
          if (payout_auto==1 || typeof payout == "undefined"){
              result = "auto";
          } else {
              let currencySign = '$';
              if ( typeof offer.detail.currency != 'undefined' ){
                  const currency = offer.detail.currency;
                  currencySign = window.BINOM.defaultLists.getCurrencySign(currency);
              }
              result = currencySign + parseFloat(payout).toFixed(2);
          }
          return result;
      }

    this.delete = function(event, scope){
        RoutingHelper.removeOffer(scope.offer);
        somethingWasChanged();
        RoutingHelper.routingChanged();
    }

    this.changeOffer = function(event, scope){
        if (scope.offer.type==3){
            WindowsHelper.chooseOffer(scope.offers, true, scope.offer);
        } else if (scope.offer.type==5){
            WindowsHelper.changeCampaign(scope.offers, true, scope.offer);
        } else {

            if (event.type=="click" && event.target.tagName.toLowerCase()=="input" && scope.state.editable==true){
                return;
            }

            if (event.type=='blur' && scope.state.bluredByKeyboard) {
                scope.state.bluredByKeyboard = false;
                return;
            } else if (event.type=='blur') {
                scope.state.editable = false;
                return;
            }

            scope.state.editable = !scope.state.editable;
            if (scope.state.editable==true){
                $("._offer_direct_url.showed")[0].focus();
            }
        }

    },

      this.inputLoseFocus = function(event, scope){
          scope.state.editable = false;
      },

      this.state.hideName = function(event, scope){
          if (scope.state.editable == false){
              return false;
          } else {
              return true;
          }
      }
    this.state.hideInput = function(event, scope){
        if (scope.state.editable == false){
            return true;
        } else {
            return false;
        }
    }

    this.offer.editUrl = function(event, scope){
        state.editable = !state.editable;
    }

    this.state.makeUneditable = function(event, scope){
        scope.state.editable = false;
        scope.state.focus_flag = true;
        setTimeout(function(){scope.state.focus_flag==false}, 200);
        //if ($(event.currentTarget))
    }

    this.offer.editDirect = function(event, scope){
        if (scope.state.editable == false) {
            scope.state.editable = !scope.state.editable;
            $("._offer_direct_url.showed")[0].focus();
        }
    },

      this.offer.edit = function(offer, state){

          if (offer.type==3){
              $.ajax({
                  type: "post",
                  url: "",
                  data: {
                      "ajax":1,
                      "type":"get_offer",
                      "id"  :offer.id_t,
                  }
              }).success(function(data){
                  data = JSON.parse(data);
                  // WindowsHelper.prepareOfferWindow(data);
                  WindowsHelper.openOfferWindow(data, offer)
              });
          } else if (offer.type==4){
              if (state.editable == false) {
                  // Logic for Direct URL
                  state.editable = !state.editable;
                  $("._offer_direct_url.showed")[0].focus();
              }
          } else if (offer.type==5){
              window.open("?page=edit_camp&id=" + offer.id_t);
          }

      };

    this.changeStatus = function(event, scope){
        RoutingHelper.routingChanged();
        var status;
        if ($(event.target).prop("checked")==true){
            status = 1;
        } else {
            status = 0;
        }
        scope.offer.status = status;
    };

    this.handlingOfferInputChange = function(event, scope){
        RoutingHelper.routingChanged();
    }

};

rivets.components['offer-buttons'] = {
    template: function(){
        return  '<div class="_lp-buttons">\
                    <a class="green-button add-offer-normal-button"    rv-on-click="chooseOffer"    > <img src="./templates/standart/images/w-add.png" class="icon add_icon">Offer</a>\
                    <a class="green-button add-offer-direct-button"    rv-on-click="addDirectOffer" > <img src="./templates/standart/images/w-add.png" class="icon add_icon">Direct URL</a>\
                    <a class="green-button add-offer-campaign-button"  rv-on-click="addCampaign"    > <img src="./templates/standart/images/w-add.png" class="icon add_icon">Campaign</a>\
                    <a class="blue-button  add-offer-new-button"       rv-on-click="addNewOffer"    > <img src="./templates/standart/images/w-star.png" class="icon new_icon">New offer</a>\
                </div>';
    },
    initialize: function(el,data){
        return new offerButtonController(data);
    }
};
function offerButtonController(data) {
    this.offers = data.offers;
    this.addNewOffer = function(event, scope){WindowsHelper.addNewOffer(scope.offers)},
      this.addDirectOffer = function(event, scope){WindowsHelper.addDirectOffer(scope.offers);}
    this.addCampaign = function(event, scope){WindowsHelper.addCampaign(scope.offers);};
    this.chooseOffer = function(event, scope){WindowsHelper.chooseOffer(scope.offers);};
}

rivets.components['actions-block'] = {
    template: function(){
        var tgl_id = RoutingHelper.getToggleId();
        return '<div class="_of-actions" data-object-type="offer">\
                    <input rv-on-click="changeStatus" id="'+tgl_id+'" type="checkbox" rv-checked="obj.button_state.not_paused" class="tgl tgl-light">\
                    <label for="'+tgl_id+'" class="tgl-btn" data-s="toggler"></label>\
                    <edit-action-button offers="offers" landings="landings" obj="obj" state="state"></edit-action-button>\
                    <div rv-on-click="delete" class="delete_btn" data-s="delete-btn"></div>\
                </div>';
    },
    initialize: function(el, data){return new actionsBlockController(data)}
};
function actionsBlockController(data) {
    this.obj = data.obj;
    this.obj.not_direct = data.obj.type !== '2';
    this.landings = data.landings;
    this.offers = data.offers;
    this.array_holder = data.array_holder;
    this.obj.button_state = {};
    // I dont understandt why just rv-checked="obj.paused" does not wokring it seems bug
    this.obj.button_state.not_paused = (function(obj){
        if (obj.status==0){
            return false;
        } else {
            return true;
        }

    })(this.obj);



    if (data.state){
        this.state = data.state;
    }

    this.delete = function(event, scope){
        somethingWasChanged();
        RoutingHelper.routingChanged();
        RoutingHelper.removeItem(scope.obj);
    };

    this.changeStatus = function(event, scope){
        RoutingHelper.routingChanged();
        var status;
        if ($(event.target).prop("checked")==true){
            status = 1;
            scope.obj.paused = false;
        } else {
            status = 0;
            scope.obj.paused = true;
        }
        scope.obj.status = status;
    };
};

rivets.components['weight-block'] = {
    template: function(){

        return  '<div rv-on-click="makeWeightEditable" class="_weight-wrapper">\
                     <span class="_weight-amount" rv-class-visible="state.not_edit_weigth" >{object.split}</span>\
                     <input rv-on-input="handleChanging" rv-on-click="handleChanging" rv-value="object.split" type="text" rv-on-focusout="makeWeightNonEditable" rv-class-hidden="state.not_edit_weigth" >\
                 </div>';
    },
    initialize: function(el, data){
        return new weightBlockController(data);
    }
};
function weightBlockController(data){

    this.object = data.object;

    this.state = {};
    this.state.not_edit_weigth = true;

    this.openInput = function(){
        scope.state.not_edit_weigth = false;
    }

    this.makeWeightNonEditable = function(event, scope){
        scope.state.not_edit_weigth = true;
    };

    this.makeWeightEditable = function(event, scope){
        scope.state.not_edit_weigth = false;
        $(event.currentTarget).find("input")[0].focus();
    }

    this.handleChanging = function(event, scope){
        event.target.value = event.target.value.replace(/[^0-9\.,]/g, "");
        RoutingHelper.routingChanged();
    }

};




rivets.components['edit-action-button'] = {
    template: function(){
        return '<div rv-on-click="editAction" offers="offers" landings="landings" class="edit_btn"></div>';
    },
    initialize: function(el, data){
        return new editButtonController(data);
    }
};
function editButtonController(data){
    this.obj = data.obj;
    if (data.state){
        this.state = data.state;
    }
    this.landings = data.landings;
    this.offers = data.offers;

    this.editAction = function(event, scope){
        if(scope.obj.not_direct !== false) {
            scope.obj.edit(scope.obj, scope.state);
        } else {
            WindowsHelper.chooseLanding(scope.landings, scope.offers, true, scope.obj);
        }
    }
};

/*
###################
*/




/*
####################
FORMATTERS
####################
*/
rivets.formatters.getOfferName = function(offer){
    if (offer.detail.url){
        return offer.detail.url;
    } else {
        return offer.detail.name;
    }
}

// TODO добавить payout auto
rivets.formatters.offerPayout = function(offer_detail){
    let currencySign = '$';
    if ( typeof offer_detail.currency != 'undefined' ){
        const currency = offer_detail.currency;
        currencySign = window.BINOM.defaultLists.getCurrencySign(currency);
    }
    if (offer_detail.payout_auto && offer_detail.payout_auto==1){
        return "auto";
    } else if (!offer_detail.payout){
        return "0.0" + currencySign;
    } else {
        return parseFloat(offer_detail.payout).toFixed(2) + currencySign;
    }

}

rivets.formatters.lowerCase = function(str){
    if (typeof str!= 'string') str = '';
    return str.toLowerCase();
}

rivets.formatters.includesMultiofferLanding = function(landings){
    return !!landings.find(function (landing) {
        return parseInt(landing.detail.offers) > 1;
    });
}


rivets.formatters.isMultioffer = function( offers ){
    return offers > 1;
}


rivets.components['rotations-select'] = {

    template: function(){
        return '<div class="choose_rotation" style="display:inline-block;margin-left:110px;">\
                    <span style="margin-right: 10px;">Rotation:</span>\
                    <select rv-on-change="changeRouting" id="rotation_input" name="rotation" data-name="rotation" rv-value="current_flow_id">\
                            <option rv-each-rotation="list_of_rotations" rv-value="rotation.id">{rotation.name}</option>\
                    </select>\
                    <a rv-on-click="editRotation" class="edit_btn" style="margin:0; position: relative; top: 7px;left:5px;"></a>\
                    <a rv-on-click="addRotation" class="plus_btn" style="margin:0; position: relative; top: 7px;left:3px;" data-s="add-rotation-btn"></a>\
                </div>';
    },
    initialize: function(el, data){
        return new rotationsSelectController(data);
    }

}

function rotationsSelectController(data){
    this.rotations = data.rotations;

    this.current_flow_id = (function(){

        if (!data.current_rotation){
            throw new Error("Не передан current_rotation");
        }

        if (!data.current_rotation.isFlow){
            return 0;
        }

        for (var i=0,l=data.list_of_rotations.length; i<l; i++){

            if (data.current_rotation.id == data.list_of_rotations[i]["id"]){
                return data.current_rotation.id;
            }
        }

    })();

    this.list_of_rotations = (function() {
        var rotations = new Array();
        rotations.push({"name":"Custom", "id":0});
        var arr = rotations.concat(data.list_of_rotations);
        return arr;
    })();

    // TODO записывать в localstorage после переключения FLOW старый ROUTING
    //  только в случае с новой кампанией
    //  не забыть очистку при открытии страницы
    this.changeRouting = function(event, scope){

        var loadingTimeout = 0;

        function setRoutingFromJSON( newRouting ){
            // When empty
            if (Array.isArray(newRouting) && newRouting.length==0){
                newRouting.paths = [];
                newRouting.rules = [];
            }

            ROUTING.paths = ROUTING.paths.splice(0, -1);
            ROUTING.rules = ROUTING.rules.splice(0, -1);

            for (var i=0,l=newRouting.paths.length;i<l;i++){
                ROUTING.paths.push(newRouting.paths[i]);
            }
            for (var i=0,l=newRouting.rules.length;i<l;i++){
                ROUTING.rules.push(newRouting.rules[i]);
            }

        }

        function setEmptyRouting(){
            ROUTING.paths = new Array();
            ROUTING.rules = new Array();
            ROUTING.paths.push( RoutingHelper.makeEmptyPath() );
            window.vmStore.commit('CHANGE_ROTATION', {rotation_id: 0});
        }

        function setCampaignCustomRouting(){
            var GETs = URLUtils.getGETParamsAsObject();
            var camp_id = GETs.id;

            if (camp_id!=""){
                $.ajax({
                    url:"./"+window.API_URL,
                    type: "post",
                    data: {
                        "action":"campaign@get_default_routing",
                        "id": camp_id
                    }
                }).success(function(data){
                    if (data != "[]") {
                        data = JSON.parse(data);
                        if ( data.rotation_id && BINOM.__page == 'edit_camp' ){ // That means - custom routing was getted and need to change rotation_id in campaign
                            window.vmStore.commit('CHANGE_ROTATION', {rotation_id: data.rotation_id});
                        } else {
                            window.vmStore.commit('CHANGE_ROTATION', {rotation_id: 0});
                        }
                        setRoutingFromJSON(data);
                    } else {
                        setEmptyRouting();
                    }
                });
            } else {
                setEmptyRouting();
            }
        }

        function addLoadAnimation(){
            $(".camp_edit_right_wrapper").css("opacity", "0.4");
        }
        function removeLoadAnimation(){
            $(".camp_edit_right_wrapper").css("opacity", "1");
        }

        var GETs = URLUtils.getGETParamsAsObject();
        var camp_id = GETs.id || "";
        if ($("#rotation_input").val() != 0){
            addLoadAnimation();
            $.ajax({
                url: "./"+window.API_URL,
                type: "post",
                data: {
                    action: 'rotation@get_routing',
                    id: $("#rotation_input").val(),
                }
            }).success(
              function(data){
                  try {
                      window.vmStore.commit('CHANGE_ROTATION', {rotation_id: $("#rotation_input").val()})
                  } catch(e) {
                      console.log(e)
                  }
                  data = JSON.parse(data);
                  setRoutingFromJSON(data);
                  removeLoadAnimation();
              });
        } else if ( camp_id=="" ) {
            setEmptyRouting();
        } else {
            if (ROUTING.current_rotation.isFlow) {
                setCampaignCustomRouting();
            } else if (!ROUTING.current_rotation.flow && ROUTING.current_rotation.id!=0){
                addLoadAnimation();
                $.ajax({
                    url: "./"+window.API_URL,
                    type: "post",
                    data: {
                        action: 'rotation@get_routing',
                        id: ROUTING.current_rotation.id,
                    }
                }).success(
                  function(data){
                      try {
                          if (BINOM.__pageType === 'edit_camp') {
                              window.vmStore.commit('CHANGE_ROTATION', {rotation_id: ROUTING.current_rotation.id})
                          } else {
                              window.vmStore.commit('CHANGE_ROTATION', {rotation_id: 0})
                          }

                      } catch(e) {
                          console.log(e)
                      }
                      data = JSON.parse(data);
                      setRoutingFromJSON(data);
                      removeLoadAnimation();
                  });
            }
        }
    }

    this.editRotation = function(){
        var id = $("#rotation_input").val();
        if (id != 0) {
            edit_url = "?page=add_rotation&id=" + id;
            var win = window.open(edit_url, '_blank');
            win.focus();
        }
    }

    this.addRotation = function(){
        window.ROUTING_UTIL_STORAGE.writeCachedRouting(window.ROUTING);
        edit_url = '?page=add_rotation&cached=1';
        var win = window.open(edit_url, '_blank');
        win.focus();
    }

}


