use enigo::{
    Button, Coordinate,
    Direction::{Click, Press, Release},
    Enigo, Mouse, Mouse, Settings,
};
use serde::Deserialize;

#[derive(Debug, Deserialize)]
pub struct Cords {
    x: i32,
    y: i32,
}

#[tauri::command]
pub fn mouse_move(cords: Cords) {
    println!("{:?}", cords);
    let mut enigo: Enigo = Enigo::new(&Settings::default()).unwrap();
    enigo.move_mouse(cords.x, cords.y, Coordinate::Abs).unwrap()
}

#[tauri::command]
pub fn mouse_click() {
    println!("{}", "click");
    let mut enigo: Enigo = Enigo::new(&Settings::default()).unwrap();
    enigo.button(Button::Left, Click);
}
