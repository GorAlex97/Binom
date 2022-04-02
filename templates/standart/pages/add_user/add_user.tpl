<div id="vue-app-container-1"></div>

<form method="post" class="user-edit-form" id="camp_save_form" action="?page=save_camp">
    <script src="templates/standart/js/rivetjs/sightglass.js?<?php echo $arr_tpl['version']; ?>"></script>
    <script src="templates/standart/js/rivetjs/rivets.min.js?<?php echo $arr_tpl['version']; ?>"></script>
    <script src="templates/standart/pages/add_user/components.js?<?php echo $arr_tpl['version']; ?>"></script>
    <script src="templates/standart/pages/routing/windowshelper.js?<?php echo $arr_tpl['version']; ?>"></script>
    <script src="templates/standart/pages/add_user/add_user.js?<?php echo $arr_tpl['version']; ?>"></script>


    <input type="hidden" name="type_save" id="type_save">
    <input type="hidden" name="type_save_ref" id="type_save_ref">

    <div class="camp_edit_header">
        <div class="camp_edit_header_left camp_name_small">
            <div class="camp_edit_header_left_wrapper">
                <h1 style="font-size:18px;"> 
                    <?php 
                        
                        echo htmlspecialchars($arr_tpl['username']);

                        if ( !empty( $arr_tpl['user_id']  ) ){
                            echo "<span>id:".$arr_tpl['user_id']."</span>" ;
                        }

                    ?>
                </h1>

                
            </div>
        </div>
        <input name = "DummyUsername" type="text" style="display:none;">
        <input name = "DummyPassword" type="password" style="display:none;">
        <div class="camp_edit_header_right">
            <div class="camp_edit_header_right_wrapper">
                <a style="cursor:default;" class="button-inactive green-button main_save_button_add_user"><img src="templates/standart/images/w-save.png" class="icon save_icon">Save</a>
                <a style="cursor:default;" class="button-inactive green-button main_save_close_button_add_user"><img src="templates/standart/images/w-save.png" class="icon save_icon">Save &amp; Close</a>
                <?php if ( isset($arr_tpl['user_id']) && !empty($arr_tpl['user_id']) ): ?>
                    <a href="?page=clone_user&user_id=<?php echo $arr_tpl['user_id']; ?>" class="green-button"><img src="templates/standart/images/w-copy.png" class="icon copy_icon">Сlone</a>
                <?php endif; ?>
                <a onclick="getPageBack();" class="gray-button"><img src="templates/standart/images/w-close.png" class="icon close_icon">Close</a>
            </div>
        </div>
    </div>
    <div class="content">
        <div class="camp_edit_loading" style="text-align: center; display: none;">
            <div class="preload_edit_camp_animation">
            </div>
        </div>
        <div class="camp_edit_left" style="display: block;">
            <div class="entry-div">
                <h2 class="camp_edit_caption">Main options</h2>

                <!-- NAME -->
                <div class="camp-field">
                    <div class="field-left">
                        <span id="name_label">Name</span>
                    </div>
                    <div class="field-right">
                        <input value="" type="text" id="name_input" class="input" name="camp_name" >
                    </div>
                    <div class="clear"></div>
                </div>

                <?php if( empty($arr_tpl["user_id"]) ): ?>                

                    <div class="camp-field">
                        <div class="field-left">
                            <span id="password_label">Password</span>
                        </div>
                        <div class="field-right">
                            <input value="" 
                                type="password" 
                                id="password_input" 
                                class="input styled_input" 
                                name="password_name"
                                autocomplete="new-password" 
                                style="height:25px;width:100%;font-size: 13px;padding-right: 30px;padding-left:7px;">
                            <div ondragstart="return false;" ondrop="return false;" class="show-password inactive" width="5%" ></div>
                        </div>
                        <div class="clear"></div>
                    </div>
                    <script>
                        
                        $( "#password_input" ).on("input", function(){
                            var pass = $( "#password_input" ).val();
                            if ( pass.length > 0 ){
                                $(".show-password").removeClass( "inactive" );
                                $(".show-password").addClass( "active" );
                            } else {
                                $(".show-password").addClass( "inactive" );
                                $(".show-password").removeClass( "active" );
                            }
                        });
                        
                        $(".show-password").on("mousedown", function(){
                            $("#password_input").attr("type", "text");
                        });
                        $("body").on("mouseup", function(){
                            $("#password_input").attr("type", "password");
                        });
                        $("body").on("mouseleave", function(){
                            $("#password_input").attr("type", "password");
                        });

                    </script>
                <?php else: ?>

                    <div class="camp-field">
                        <div class="field-left">
                            <span id="password_label">Password</span>
                        </div>
                        <div class="field-right">
                            <span class="change_password_toggle closed">Change password</span>
                            <input value="" 
                                type="password" 
                                id="password1_input" 
                                class="input styled_input" 
                                name="password1_name" 
                                style="display: none;
                                       width: 100%;
                                       font-size: 13px;
                                       height: 25px;
                                       margin-bottom: 10px;
                                       padding-left: 7px;
                                       margin-top: 10px;"
                                placeholder="New password"
                                onfocus="this.placeholder=''"
                                onblur="this.placeholder='New password'">
                            <input value="" 
                                type="password" 
                                id="password2_input" 
                                class="input styled_input" 
                                name="password2_name" 
                                style="display: none;
                                       width: 100%;
                                       font-size: 13px;
                                       height: 25px;
                                       margin-bottom: 10px;
                                       padding-left: 7px;"
                                placeholder="Repeat new password"
                                onfocus="this.placeholder=''"
                                onblur="this.placeholder='Repeat new password'">
                        </div>
                        <div class="clear"></div>
                    </div>

                <?php endif; ?>

                <!-- GROUP -->
                <div class="camp-field">
                    <div class="field-left">
                        <span id="group_label">Group</span>
                        <span class="tooltip" title="The group is used to help you tag your campaigns. You can add new group, just select Add new option."></span>
                    </div>
                    <div class="field-right">
                        <select name="user_group" id="group_input">
                            <option value="1">Administrator</option>
                            <option value="2">User</option>
                        </select>
                    </div>
                    <div class="clear"></div>
                </div>

                 <div class="camp-field">
                    <div class="field-left">
                        <span id="group_label">
                            <label for="hide-profit-input">
                                Hide Profit
                            </label>
                        </span>
                    </div>
                    <div class="field-right" style="line-height: 24px;">
                        <input 
                            type="checkbox" 
                            name="no_profit" 
                            id="hide-profit-input" 
                        />
                    </div>
                    <div class="clear"></div>
                </div>
                                 <div class="camp-field">
                    <div class="field-left">
                        <span id="group_label">
                            <label for="allow-local-input">
                                Allow local file editing
                            </label>
                        </span>
                    </div>
                    <div class="field-right" style="line-height: 24px;">
                        <input 
                            type="checkbox" 
                            name="allow_local" 
                            id="allow-local-input" 
                        />
                    </div>
                    <div class="clear"></div>
                </div>

                <div class="camp-field">
                    <div class="field-left">
                        2FA
                    </div>
                    <div class="field-right">
                        <?php if (isset($arr_tpl['2fa_enabled']) && !empty($arr_tpl['2fa_enabled'])){ ?>
                            <button type="button" class="green-button twofa-disable">Turn off</button>
                        <?php } else { ?>
                            <span>Disabled</span>
                        <?php } ?>                        
                    </div>
                    <div class="clear"></div>
                </div>

                <?php if (isset($arr_tpl['auth_block_enabled']) && !empty($arr_tpl['auth_block_enabled'])){ ?>
                    <div class="camp-field">
                        <div class="field-left">
                            Auth Blocked
                        </div>
                        <div class="field-right">
                            <button type="button" class="green-button auth-unblock">Unblock</button>
                        </div>
                        <div class="clear"></div>
                    </div>
                <?php } ?>

            </div>
        </div>
        <div class="camp_edit_right routing-system" style="display: block;">
            <div class="entry-div">
                <div class="camp_edit_right_wrapper">
                    <input type="hidden" value="6" name="camp_id">
                    <div class="routing-app-header">
                        <h2 class="camp_edit_caption" style="display:inline-block;width:150px;">
                            Permissions
                            <span class="tooltip" title="All - Means the user has access to all items. Readonly - The user can see but can't make actions. No - The user has no access to all items."></span>
                        </h2>
                        <div class="user-permission-wrapper" id="permission-app">
                        </div>
                    </div>

                </div>
            </div>
        </div>
        <div class="clear"></div>
    </div>
</form>
