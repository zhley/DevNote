// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, TrayIconBuilder, TrayIconEvent},
    Manager, WindowEvent, App, GlobalShortcutManager, WebviewWindowBuilder, WebviewUrl,
};

fn setup_system_tray(app: &mut App) -> Result<(), Box<dyn std::error::Error>> {
    // 创建托盘菜单
    let show_item = MenuItem::with_id(app, "show", "显示窗口", true, None::<&str>)?;
    let quit_item = MenuItem::with_id(app, "quit", "退出", true, None::<&str>)?;
    let menu = Menu::with_items(app, &[&show_item, &quit_item])?;

    // 创建托盘图标
    let _tray = TrayIconBuilder::with_id("main-tray")
        .tooltip("DevNote - 开发笔记")
        .icon(app.default_window_icon().unwrap().clone())
        .menu(&menu)
        .on_tray_icon_event(|tray, event| {
            if let TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: tauri::tray::MouseButtonState::Up,
                ..
            } = event
            {
                let app = tray.app_handle();
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.show();
                    let _ = window.set_focus();
                }
            }
        })
        .on_menu_event(|app, event| match event.id.as_ref() {
            "show" => {
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.show();
                    let _ = window.set_focus();
                }
            }
            "quit" => {
                app.exit(0);
            }
            _ => {}
        })
        .build(app)?;

    Ok(())
}

fn create_command_window(app: &tauri::AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    // 检查命令窗口是否已存在
    if let Some(existing_window) = app.get_webview_window("command") {
        let _ = existing_window.show();
        let _ = existing_window.set_focus();
        return Ok(());
    }

    // 创建新的命令窗口
    let window = WebviewWindowBuilder::new(app, "command", WebviewUrl::App("index.html#/command".into()))
        .title("")
        .resizable(false)
        .fullscreen(false)
        .decorations(false)  // 无标题栏
        .always_on_top(true)
        .skip_taskbar(true)
        .focused(true)
        .center()
        .inner_size(400.0, 50.0)
        .build()?;

    // 监听窗口失焦事件，自动关闭
    let window_clone = window.clone();
    window.on_window_event(move |event| {
        if let tauri::WindowEvent::Focused(false) = event {
            let _ = window_clone.close();
        }
    });

    Ok(())
}

fn create_editor_window(app: &tauri::AppHandle, data: &str) -> Result<(), Box<dyn std::error::Error>> {
    // 检查编辑窗口是否已存在
    if let Some(existing_window) = app.get_webview_window("editor") {
        let _ = existing_window.close();
    }

    // 创建新的编辑窗口
    let url = format!("index.html#/editor?data={}", urlencoding::encode(data));
    let window = WebviewWindowBuilder::new(app, "editor", WebviewUrl::App(url.into()))
        .title("")
        .resizable(false)
        .decorations(false)
        .always_on_top(true)
        .skip_taskbar(true)
        .focused(true)
        .center()
        .inner_size(500.0, 300.0)
        .build()?;

    // 监听窗口失焦事件，自动关闭
    let window_clone = window.clone();
    window.on_window_event(move |event| {
        if let tauri::WindowEvent::Focused(false) = event {
            let _ = window_clone.close();
        }
    });

    Ok(())
}

fn setup_global_shortcuts(app: &mut App) -> Result<(), Box<dyn std::error::Error>> {
    let app_handle = app.handle().clone();
    
    app.global_shortcut_manager().register("Alt+`", move || {
        if let Err(e) = create_command_window(&app_handle) {
            eprintln!("Failed to create command window: {}", e);
        }
    })?;

    Ok(())
}

// Tauri 命令函数
#[tauri::command]
fn create_editor_from_command(app: tauri::AppHandle, command_data: String) -> Result<(), String> {
    create_editor_window(&app, &command_data)
        .map_err(|e| e.to_string())
}

fn handle_window_event(window: &tauri::Window, event: &WindowEvent) {
    if let WindowEvent::CloseRequested { api, .. } = event {
        // 阻止窗口关闭，改为隐藏
        api.prevent_close();
        let _ = window.hide();
    }
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_sql::Builder::default().build())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            setup_system_tray(app)?;
            setup_global_shortcuts(app)?;
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![create_editor_from_command])
        .on_window_event(handle_window_event)
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
