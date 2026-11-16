use std::{collections::HashSet, fs, path::{Path, PathBuf}, time::{Duration, SystemTime}};
use tauri::Manager;

const STATE_FILE: &str = "state.json";
const IMAGES_DIR: &str = "images";
const IMAGE_EXT: &str = "txt";
const UNUSED_IMAGE_GRACE_SECS: u64 = 7 * 24 * 60 * 60;
const LOG_FILE: &str = "log.jsonl";
const LOG_OLD_FILE: &str = "log.old.jsonl";
const LOG_MAX_BYTES: u64 = 512 * 1024;
const LOG_MAX_LINE_CHARS: usize = 4096;

fn data_dir(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    app.path().app_data_dir().map_err(|e| e.to_string())
}

// id идёт в имя файла: только буквы, цифры, - и _ (защита от ../)
fn check_id(id: &str) -> Result<(), String> {
    let is_ok = !id.is_empty()
        && id.len() <= 64
        && id.chars().all(|c| c.is_ascii_alphanumeric() || c == '-' || c == '_');
    if is_ok { Ok(()) } else { Err(format!("bad id: {id}")) }
}

// Пишем во временный файл и переименовываем: обрыв не оставит половину файла
fn write_atomic(path: &Path, content: &str) -> Result<(), String> {
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    let tmp = path.with_extension("tmp");
    fs::write(&tmp, content).map_err(|e| e.to_string())?;
    fs::rename(&tmp, path).map_err(|e| e.to_string())
}

// Добавляет строку в журнал. Когда файл дорос до max_bytes, он уходит в .old (старый .old заменяется).
fn append_capped(path: &Path, old_path: &Path, line: &str, max_bytes: u64) -> Result<(), String> {
    use std::io::Write;
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    if fs::metadata(path).map(|m| m.len() >= max_bytes).unwrap_or(false) {
        fs::rename(path, old_path).map_err(|e| e.to_string())?;
    }
    let mut file = fs::OpenOptions::new().create(true).append(true).open(path).map_err(|e| e.to_string())?;
    let short: String = line.chars().take(LOG_MAX_LINE_CHARS).collect();
    writeln!(file, "{}", short.replace('\n', " ")).map_err(|e| e.to_string())
}

// Удаляет файлы картинок, которых нет в keep и которые не менялись дольше grace.
// Отсрочка защищает от потери данных, если состояние не загрузилось и приложение стартовало с пустого.
fn cleanup_dir(dir: &Path, keep: &HashSet<String>, grace: Duration, now: SystemTime) -> Result<usize, String> {
    if !dir.exists() {
        return Ok(0);
    }
    let mut removed = 0;
    for entry in fs::read_dir(dir).map_err(|e| e.to_string())? {
        let path = entry.map_err(|e| e.to_string())?.path();
        let is_image = path.extension().and_then(|e| e.to_str()) == Some(IMAGE_EXT);
        let id = path.file_stem().and_then(|s| s.to_str()).unwrap_or_default().to_string();
        if !is_image || keep.contains(&id) {
            continue;
        }
        let modified = fs::metadata(&path).and_then(|m| m.modified()).map_err(|e| e.to_string())?;
        if now.duration_since(modified).unwrap_or_default() >= grace {
            fs::remove_file(&path).map_err(|e| e.to_string())?;
            removed += 1;
        }
    }
    Ok(removed)
}

fn image_path(app: &tauri::AppHandle, id: &str) -> Result<PathBuf, String> {
    check_id(id)?;
    Ok(data_dir(app)?.join(IMAGES_DIR).join(format!("{id}.{IMAGE_EXT}")))
}

// Пустая строка — сохранённого состояния ещё нет
#[tauri::command]
fn load_state(app: tauri::AppHandle) -> Result<String, String> {
    let path = data_dir(&app)?.join(STATE_FILE);
    if !path.exists() {
        return Ok(String::new());
    }
    fs::read_to_string(path).map_err(|e| e.to_string())
}

#[tauri::command]
fn save_state(app: tauri::AppHandle, json: String) -> Result<(), String> {
    write_atomic(&data_dir(&app)?.join(STATE_FILE), &json)
}

#[tauri::command]
fn load_image(app: tauri::AppHandle, id: String) -> Result<String, String> {
    fs::read_to_string(image_path(&app, &id)?).map_err(|e| e.to_string())
}

#[tauri::command]
fn save_image(app: tauri::AppHandle, id: String, data: String) -> Result<(), String> {
    write_atomic(&image_path(&app, &id)?, &data)
}

// keep — id картинок, которые есть в сохранённом состоянии. Возвращает, сколько файлов удалено.
#[tauri::command]
fn cleanup_images(app: tauri::AppHandle, keep: Vec<String>) -> Result<usize, String> {
    let keep: HashSet<String> = keep.into_iter().collect();
    let dir = data_dir(&app)?.join(IMAGES_DIR);
    cleanup_dir(&dir, &keep, Duration::from_secs(UNUSED_IMAGE_GRACE_SECS), SystemTime::now())
}

// Журнал ошибок интерфейса: одна JSON-строка {f,e,c,ctx} на запись
#[tauri::command]
fn append_log(app: tauri::AppHandle, line: String) -> Result<(), String> {
    let dir = data_dir(&app)?;
    append_capped(&dir.join(LOG_FILE), &dir.join(LOG_OLD_FILE), &line, LOG_MAX_BYTES)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![load_state, save_state, load_image, save_image, cleanup_images, append_log])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn check_id_accepts_plain_ids() {
        assert!(check_id("i1abc-2_x").is_ok());
    }

    #[test]
    fn check_id_rejects_path_tricks() {
        for bad in ["", "../x", "a/b", "a.b", "a b"] {
            assert!(check_id(bad).is_err(), "{bad}");
        }
    }

    #[test]
    fn cleanup_dir_removes_only_old_unused_images() {
        let dir = std::env::temp_dir().join(format!("nb-img-{}", std::process::id()));
        fs::create_dir_all(&dir).unwrap();
        let now = SystemTime::now();
        let old = now - Duration::from_secs(10 * 24 * 60 * 60);
        for name in ["keep.txt", "unused_old.txt", "unused_new.txt", "note.md"] {
            fs::write(dir.join(name), "x").unwrap();
        }
        for name in ["keep.txt", "unused_old.txt", "note.md"] {
            fs::File::options().write(true).open(dir.join(name)).unwrap().set_modified(old).unwrap();
        }
        let keep: HashSet<String> = ["keep".to_string()].into_iter().collect();
        let removed = cleanup_dir(&dir, &keep, Duration::from_secs(UNUSED_IMAGE_GRACE_SECS), now).unwrap();
        assert_eq!(removed, 1);
        assert!(dir.join("keep.txt").exists());
        assert!(!dir.join("unused_old.txt").exists());
        assert!(dir.join("unused_new.txt").exists());
        assert!(dir.join("note.md").exists());
        fs::remove_dir_all(dir).unwrap();
    }

    #[test]
    fn cleanup_dir_without_folder_is_ok() {
        let missing = std::env::temp_dir().join("nb-img-missing-folder");
        let keep = HashSet::new();
        assert_eq!(cleanup_dir(&missing, &keep, Duration::from_secs(1), SystemTime::now()).unwrap(), 0);
    }

    #[test]
    fn append_capped_appends_and_rotates() {
        let dir = std::env::temp_dir().join(format!("nb-log-{}", std::process::id()));
        let log = dir.join("log.jsonl");
        let old = dir.join("log.old.jsonl");
        append_capped(&log, &old, "one", 6).unwrap();
        append_capped(&log, &old, "two", 6).unwrap();
        assert_eq!(fs::read_to_string(&log).unwrap(), "one\ntwo\n");
        // файл уже >= 6 байт: уходит в .old, новая запись в чистый файл
        append_capped(&log, &old, "three", 6).unwrap();
        assert_eq!(fs::read_to_string(&old).unwrap(), "one\ntwo\n");
        assert_eq!(fs::read_to_string(&log).unwrap(), "three\n");
        fs::remove_dir_all(dir).unwrap();
    }

    #[test]
    fn append_capped_keeps_one_line_per_entry() {
        let dir = std::env::temp_dir().join(format!("nb-log2-{}", std::process::id()));
        let log = dir.join("log.jsonl");
        append_capped(&log, &dir.join("o"), "a\nb", 1000).unwrap();
        assert_eq!(fs::read_to_string(&log).unwrap(), "a b\n");
        fs::remove_dir_all(dir).unwrap();
    }

    #[test]
    fn write_atomic_creates_dirs_and_file() {
        let dir = std::env::temp_dir().join(format!("nb-test-{}", std::process::id()));
        let file = dir.join("sub").join("a.json");
        write_atomic(&file, "{}").unwrap();
        assert_eq!(fs::read_to_string(&file).unwrap(), "{}");
        fs::remove_dir_all(dir).unwrap();
    }
}
