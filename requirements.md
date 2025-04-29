# メモアプリ要件仕様書

## 1. 機能要件
- 画面構成
    サイドバーと各ページの機能の2カラム
- フォルダ一覧ページ
    フォルダ一覧ページでフォルダを管理する。
    新規フォルダ作成ボタンを押すことでフォルダを作成できる。
    新規フォルダ作成ボタンは右のカラムの右上に位置する。
    フォルダを作成すると右のカラムの中央に表示される。
    作ったフォルダは縦に増えていく。
    作ったフォルダを押すとそのフォルダのメモ一覧に飛ぶ。
    フォルダの右側にはimport DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';これを使ったDriveFileRenameOutlineIconがあり、これを押すとフォルダの名前を変更できる。
    その右にはimport DeleteIcon from '@mui/icons-material/Delete';のDeleteIconがありこれを押すとフォルダを削除できる。
- メモ作成・管理
    メモ一覧ページでメモを管理する。
    新規メモ作成ボタンを押すことでメモを作成できる。
    新規メモ作成ボタンは右のカラムの右上に位置する。
    メモを作成すると右のカラムの中央に表示される。
    作ったメモは縦に増えていく。
    作ったメモを押すとメモが開かれる。
    メモの右側にはimport DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';これを使ったDriveFileRenameOutlineIconがあり、これを押すとメモの名前を変更できる。
- 設定機能

## 2. 技術スタック
- フロントエンド: React(vite), MUI
- データ保存: indexedDB