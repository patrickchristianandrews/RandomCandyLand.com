import os
import zipfile

def zip_dir(src_dir, output_zip, filter_fn=None):
    with zipfile.ZipFile(output_zip, 'w', zipfile.ZIP_DEFLATED) as z:
        for root, dirs, files in os.walk(src_dir):
            for file in files:
                file_path = os.path.join(root, file)
                rel_path = os.path.relpath(file_path, src_dir)
                if filter_fn and not filter_fn(rel_path):
                    continue
                z.write(file_path, rel_path)

def make_complete_zip():
    exclude_prefixes = ('node_modules', '.git', 'public/randomcandyland-complete.zip', 'public/trumpagotchi-project.zip')
    def include_file(rel):
        if any(rel.startswith(p) for p in exclude_prefixes):
            return False
        if rel.endswith('.zip'):
            return False
        return True

    with zipfile.ZipFile('public/randomcandyland-complete.zip', 'w', zipfile.ZIP_DEFLATED) as z:
        # Include root files
        root_files = ['index.html', 'CNAME', 'README.md', 'package.json', 'tsconfig.json', 'vite.config.ts', 'server.ts', 'metadata.json', '.gitignore']
        for rf in root_files:
            if os.path.exists(rf):
                z.write(rf, rf)
        
        # Include dirs
        for d in ['src', 'public', '.github', 'dist']:
            if os.path.exists(d):
                for root, _, files in os.walk(d):
                    for f in files:
                        fp = os.path.join(root, f)
                        rel = os.path.relpath(fp, '.')
                        if include_file(rel):
                            z.write(fp, rel)

    # Copy to trumpagotchi-project.zip
    import shutil
    shutil.copyfile('public/randomcandyland-complete.zip', 'public/trumpagotchi-project.zip')
    print('Created public/randomcandyland-complete.zip and public/trumpagotchi-project.zip')

def make_pages_zip():
    with zipfile.ZipFile('public/github-pages-ready.zip', 'w', zipfile.ZIP_DEFLATED) as z:
        for root, _, files in os.walk('dist'):
            for f in files:
                fp = os.path.join(root, f)
                rel = os.path.relpath(fp, 'dist')
                z.write(fp, rel)
    print('Created public/github-pages-ready.zip')

if __name__ == '__main__':
    make_pages_zip()
    make_complete_zip()
