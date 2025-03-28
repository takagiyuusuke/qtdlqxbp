from PIL import Image
import os

# 現在のディレクトリを取得
current_dir = os.getcwd()

# ディレクトリ内のファイルを走査
for filename in os.listdir(current_dir):
    # JPEG画像のみ対象（拡張子が.jpgまたは.jpegのファイル）
    if filename.lower().endswith((".jpg", ".jpeg")):
        try:
            # 画像を開く
            img = Image.open(filename)
            # グレースケール変換
            gray_img = img.convert("L")
            # 出力ファイル名の作成
            name, ext = os.path.splitext(filename)
            if name.startswith("gray_"):
                continue
            output_filename = f"gray_{name}{ext}"
            # 画像を保存
            gray_img.save(output_filename)
            print(f"{filename} → {output_filename} に変換完了")
        except Exception as e:
            print(f"{filename} の変換中にエラー: {e}")
