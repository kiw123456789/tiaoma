#!/bin/bash
# รันไฟล์นี้จากโฟลเดอร์หลักของโปรเจกต์ (ที่มีโฟลเดอร์ image/ อยู่ข้างใน)
# เพื่อเปลี่ยนชื่อไฟล์รูปภาพจากภาษาไทยเป็นภาษาอังกฤษ ให้ตรงกับโค้ดที่แก้ไว้แล้ว
cd image || { echo "ไม่พบโฟลเดอร์ image/ กรุณารันสคริปต์นี้จากโฟลเดอร์หลักของโปรเจกต์"; exit 1; }

mv -v "พื้นหลัง6.jpg"            "hero-bg.jpg"
mv -v "ดอยอินทนนท์.jpg"          "doi-inthanon.jpg"
mv -v "วัดพระแก้ว.jpg"           "wat-phra-kaew.jpg"
mv -v "เกาะพีพี.jpg"             "phi-phi.jpg"
mv -v "เขาใหญ่.jpg"              "khao-yai.jpg"
mv -v "เมืองเก่าเชียงใหม่.png"    "chiangmai-old-city.png"
mv -v "หาดภูเก็ต.jpg"            "phuket-beach.jpg"
mv -v "ปาย.jpg"                  "pai.jpg"
mv -v "เกาะสมุย.png"             "koh-samui.png"
mv -v "อยุธยา.jpg"               "ayutthaya.jpg"

echo "เปลี่ยนชื่อไฟล์เสร็จแล้ว"
