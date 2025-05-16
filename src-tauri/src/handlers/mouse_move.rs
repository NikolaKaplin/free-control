use enigo::{Coordinate, Enigo, Mouse, Settings};
#[tauri::command]
pub fn mouse_move(x: i32, y: i32) {
    let mut enigo = Enigo::new(&Settings::default()).unwrap();
    enigo.move_mouse(x, y, Coordinate::Abs).unwrap()
}