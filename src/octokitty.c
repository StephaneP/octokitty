#include <pebble.h>

#define MAX_ISSUES 20
#define MAX_REPOS 20
#define KEY_TOKEN 10


typedef struct {
  char full_name;
  char html_url;
  char description[250];
} Repository;

enum {
  OCTO_KITTY_TOKEN,
  OCTO_KITTY_RESULT,
  OCTO_KITTY_REFRESH,
  OCTO_KITTY_ERROR
};

static Repository repositories[MAX_REPOS];

int num_repositories;

static Window *window;
static TextLayer *text_layer;

static void window_load(Window *window) {
  Layer *window_layer = window_get_root_layer(window);
  GRect bounds = layer_get_bounds(window_layer);

  text_layer = text_layer_create((GRect) { .origin = { 0, 72 }, .size = { bounds.size.w, 20 } });
  text_layer_set_text(text_layer, "Welcome to Octokitty!");
  text_layer_set_text_alignment(text_layer, GTextAlignmentCenter);
  layer_add_child(window_layer, text_layer_get_layer(text_layer));
}

static void window_unload(Window *window) {
  text_layer_destroy(text_layer);
}

void showConnectedMessage(){
  text_layer_set_text( text_layer, "Connected to Github!" );
}

void getUserAccountInfo(){
  Tuplet refresh_tuple = TupletInteger(OCTO_KITTY_REFRESH, 1);
  DictionaryIterator *iter;
  app_message_outbox_begin(&iter);

  if( iter == NULL ){
    return;
  }

  text_layer_set_text(text_layer, "Getting Repositories");

  dict_write_tuplet(iter, &refresh_tuple);
  dict_write_end(iter);
  app_message_outbox_send();
}

static void in_received_handler(DictionaryIterator *iter, void *context) {
  Tuple *tuple_token = dict_find(iter, OCTO_KITTY_TOKEN);
  Tuple *tuple_error = dict_find(iter, OCTO_KITTY_ERROR);

  if( tuple_error ){
    text_layer_set_text( text_layer, tuple_error->value->cstring );
  }else if( tuple_token ){
    text_layer_set_text( text_layer, "Connected to Github!" );
    persist_write_string( KEY_TOKEN, tuple_token->value->cstring );

    getUserAccountInfo();
  }else{
    text_layer_set_text( text_layer, "Connect to Github!" );
  }
}

static void in_dropped_handler(AppMessageResult reason, void *context) {
  APP_LOG(APP_LOG_LEVEL_DEBUG, "Incoming AppMessage from Pebble dropped, %d", reason);
}

static void out_sent_handler(DictionaryIterator *sent, void *context) {
  // outgoing message was delivered
}

static void out_failed_handler(DictionaryIterator *failed, AppMessageResult reason, void *context) {
  APP_LOG(APP_LOG_LEVEL_DEBUG, "Failed to send AppMessage to Pebble");
}

static void appmessage_init(void){
  app_message_open(app_message_inbox_size_maximum(), app_message_outbox_size_maximum());
  app_message_register_inbox_received(in_received_handler);
  app_message_register_inbox_dropped(in_dropped_handler);
  app_message_register_outbox_sent(out_sent_handler);
  app_message_register_outbox_failed(out_failed_handler);
}

static void init(void) {
  appmessage_init();

  window = window_create();

  window_set_window_handlers(window, (WindowHandlers) {
    .load = window_load,
    .unload = window_unload,
  });
  const bool animated = true;
  window_stack_push(window, animated);
}

static void deinit(void) {
  window_destroy(window);
}

int main(void) {
  init();

  APP_LOG(APP_LOG_LEVEL_DEBUG, "Done initializing, pushed window: %p", window);

  app_event_loop();
  deinit();
}
