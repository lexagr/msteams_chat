const {shell, ipcRenderer} = require("electron");
const $ = require("jquery");

const ui_events_pipe = 'ui-events-pipe';
const max_window_height = window.outerHeight/1.2;

ipcRenderer.send(ui_events_pipe, 'put-to-tray');

ipcRenderer.on(ui_events_pipe, (event, msg, data) => {
    if(msg){
        switch(msg){
            case 'new_message': {
                if(data){
                    if($(`li.message[data-message-id="${data.message_id}"]`).length > 0) return; // message already exists

                    if(data.message_type == 'RichText/Html'){
                        // let elementBuild = $(data.content);
        
                        // let images = ''; // need parser for emoji/images?
                        // elementBuild.find('img').each((i, e) => {
                        //     if($(e).attr('itemtype').search('schema.skype.com/Emoji') != -1){
                        //         images += `<img src="${$(e).attr('src')}" alt="image" class="emoji">`;
                        //     }else{
                        //         //images += `(${$(e).attr('src')}) <img src="${$(e).attr('src')}" alt="image">`;
                        //         images += `<картинка>`; // надо загружать картинку либо с куками, либо с хидером Authorization
                        //     }
                        // });
                        // data.content = `${elementBuild.text()} ${images}`;
        
                        data.content = $(data.content).find('>div');
                        $(data.content).find('span[class*="animated-emoticon-"]').each((i, e) => {
                            $(e).replaceWith(`<img src="${$(e).find('img').attr('src')}" alt="image" class="emoji">`);
                        });
                        data.content = data.content.html();
        
                        //data.content = $(data.content).text();
                    }
        
                    let newMsg = $(`<li class="message" data-message-id="${data.message_id}">
                        <div class="author">${data.author}</div>
                        <div class="content">${data.content}</div>
                    </li>`).addClass('hide');
        
                    let messages_block = $('ul.messages');
                    let messages = messages_block.find('li.message');
        
                    $('.content-prompt').closest('li.message').remove();
                    messages_block.append(newMsg);
                    setTimeout(() => {
                        newMsg.removeClass('hide');
                    }, 250);
                    
                    if(messages_block.height() > max_window_height){
                        let needToClear = messages_block.height()-max_window_height;
                        let clearedHeight = 0;
        
                        messages.each((i, e) => {
                            clearedHeight += $(e).height();
                            $(e).remove();
        
                            return needToClear-clearedHeight > 0;
                        });
                    }
                }
                break;
            }

            case 'hide_chat': {
                $('body').addClass('hide');
                break;
            }

            case 'show_chat': {
                $('body').removeClass('hide');
                break;
            }

            default: break;
        }
    }
});
