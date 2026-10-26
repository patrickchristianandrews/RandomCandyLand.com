import zlib
import struct

def make_png(width, height, color_rgb=(212, 175, 55)):
    # Create raw image bytes (RGBA)
    r, g, b = color_rgb
    raw_data = bytearray()
    for y in range(height):
        raw_data.append(0) # filter type 0 (None)
        for x in range(width):
            # Rounded border / inner circular shading
            dx = x - width / 2
            dy = y - height / 2
            dist = (dx*dx + dy*dy) ** 0.5
            radius = width * 0.45
            
            if dist > radius:
                # Outside circle
                raw_data.extend([12, 6, 23, 255]) # Dark navy
            elif dist > radius - 8:
                # Golden rim
                raw_data.extend([251, 191, 36, 255])
            else:
                # Golden gradient center
                factor = 1.0 - (dist / radius) * 0.4
                raw_data.extend([int(r * factor), int(g * factor), int(b * factor), 255])
                
    # PNG signature
    png = b'\x89PNG\r\n\x1a\n'
    
    # IHDR chunk
    ihdr_data = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)
    ihdr_crc = zlib.crc32(b'IHDR' + ihdr_data)
    png += struct.pack('>I', len(ihdr_data)) + b'IHDR' + ihdr_data + struct.pack('>I', ihdr_crc)
    
    # IDAT chunk
    compressed = zlib.compress(bytes(raw_data), 9)
    idat_crc = zlib.crc32(b'IDAT' + compressed)
    png += struct.pack('>I', len(compressed)) + b'IDAT' + compressed + struct.pack('>I', idat_crc)
    
    # IEND chunk
    iend_crc = zlib.crc32(b'IEND')
    png += struct.pack('>I', 0) + b'IEND' + struct.pack('>I', iend_crc)
    
    return png

for name, size in [('public/icon-192.png', 192), ('public/icon-512.png', 512), ('public/apple-touch-icon.png', 180), ('public/favicon.png', 32)]:
    data = make_png(size, size)
    with open(name, 'wb') as f:
        f.write(data)
    print(f"Generated {name} ({size}x{size})")
