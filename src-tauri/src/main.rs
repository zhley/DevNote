// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::{Deserialize, Serialize};
use tauri::{
    menu::{Menu, MenuItem}, tray::{MouseButton, TrayIconBuilder, TrayIconEvent}, App, Emitter, Manager, WebviewUrl, WebviewWindowBuilder, WindowEvent
};
use tauri_plugin_global_shortcut::{Code, Modifiers, Shortcut, GlobalShortcutExt};

fn setup_system_tray(app: &mut App) -> Result<(), Box<dyn std::error::Error>> {
    // 创建托盘菜单
    let show_item = MenuItem::with_id(app, "show", "显示窗口", true, None::<&str>)?;
    let test_command_item = MenuItem::with_id(app, "test_command", "测试命令窗口", true, None::<&str>)?;
    let quit_item = MenuItem::with_id(app, "quit", "退出", true, None::<&str>)?;
    let menu = Menu::with_items(app, &[&show_item, &test_command_item, &quit_item])?;

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
            "test_command" => {
                if let Err(e) = create_command_window(app) {
                    eprintln!("Failed to create command window: {}", e);
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
    WebviewWindowBuilder::new(app, "command", WebviewUrl::App("index.html?window=command".into()))
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
    Ok(())
}

#[derive(Debug, Deserialize, Serialize, Clone)]
struct EditorParams{
    block_type: String,
    title: Option<String>
}

#[tauri::command]
fn create_editor_window(app: tauri::AppHandle, params: EditorParams) -> Result<(), String> {
    // 检查编辑窗口是否已存在
    if let Some(existing_window) = app.get_webview_window("editor") {
        let _ = existing_window.close();
    }

    // 创建新的编辑窗口
    let editor_window = WebviewWindowBuilder::new(&app, "editor", WebviewUrl::App("index.html?window=editor".into()))
        .title("")
        .resizable(false)
        .decorations(true)
        .always_on_top(true)
        .skip_taskbar(true)
        .focused(true)
        .center()
        .inner_size(500.0, 300.0)
        .build()
        .map_err(|e| format!("Failed to create window: {}", e))?;

    editor_window.emit("init-editor", params).map_err(|e| e.to_string())?;
    Ok(())
}

fn setup_global_shortcuts(app: &mut App) -> Result<(), Box<dyn std::error::Error>> {
    let app_handle = app.handle().clone();
    
    // 创建快捷键 Alt+`
    let shortcut = Shortcut::new(Some(Modifiers::ALT), Code::Backquote);
    
    // 注册快捷键
    app_handle.global_shortcut().register(shortcut)?;

    Ok(())
}

fn handle_window_event(window: &tauri::Window, event: &WindowEvent) {
    if let WindowEvent::CloseRequested { api, .. } = event {
        // 只对主窗口阻止关闭并隐藏，其他窗口正常关闭
        if window.label() == "main" {
            api.prevent_close();
            let _ = window.hide();
        }
        // command 和 editor 窗口允许正常关闭
    }
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_sql::Builder::default().build())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(
            tauri_plugin_global_shortcut::Builder::new()
                .with_handler(|app, _shortcut, _event| {
                    if let Err(e) = create_command_window(app) {
                        eprintln!("Failed to create command window: {}", e);
                    }
                })
                .build(),
        )
        .setup(|app| {
            setup_system_tray(app)?;
            setup_global_shortcuts(app)?;
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![create_editor_window])
        .on_window_event(handle_window_event)
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
