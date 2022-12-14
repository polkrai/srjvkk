# -*- encoding: utf-8 -*-
def populate(s):
    count = s.query(model.TaskGroup).count()
    if(count > 0): return
    actg = model.TaskGroup()
    actg.name = u'สังคมสงเคราะห์'
    s.save(actg)
    actg2 = model.TaskGroup()
    actg2.name = u'แพทย์'
    s.save(actg2)
    actg3 = model.TaskGroup()
    actg3.name = u'การเงิน'
    s.save(actg3)
    
    act = model.Activity()
    act.name = u'สังคมสงเคราะห์'
    act.group = actg
    s.save(act)
    act = model.Activity()
    act.name = u'ซักประวัติ'
    act.group = actg
    s.save(act)
    act = model.Activity()
    act.name = u'พบแพทย์'
    act.group = actg2
    s.save(act)
    act = model.Activity()
    act.name = u'นิติจิตเวช'
    act.group = actg2
    s.save(act)
    act = model.Activity()
    act.name = u'จิตวิทยา'
    act.group = actg2
    s.save(act)
    act = model.Activity()
    act.name = u'ชำระเงิน'
    act.group = actg3
    s.save(act)
    
    pt = model.Patient()
    pt.hn = '00001'
    pt.prefix = u'นาย'
    pt.firstname = u'หนึ่งเดียว'
    pt.lastname = u'สกุลดี'
    pt.sex = 'M'
    s.save(pt)
    
    pt = model.Patient()
    pt.hn = '00002'
    pt.prefix = u'นาง'
    pt.firstname = u'ทวิจิต'
    pt.lastname = u'สกุลเ่ก่ง'
    pt.sex = 'F'
    s.save(pt)
    
    pt = model.Patient()
    pt.hn = '00003'
    pt.prefix = u'นาย'
    pt.firstname = u'ไตรภพ'
    pt.lastname = u'สกุลยอด'
    pt.sex = 'M'
    s.save(pt)
    
    pt = model.Patient()
    pt.hn = '00004'
    pt.prefix = u'นาย'
    pt.firstname = u'จตุพล'
    pt.lastname = u'สกุลเลิศ'
    pt.sex = 'M'
    s.save(pt)
    
    pt = model.Patient()
    pt.hn = '00005'
    pt.prefix = u'นางสาว'
    pt.firstname = u'เบญจม'
    pt.lastname = u'สกุลงาม'
    pt.sex = 'F'
    s.save(pt)
    
    iut = model.ItemUnit()
    iut.name = u'ครั้ง'
    s.save(iut)
    
    ium = model.ItemUnit()
    ium.name = u'แผง'
    s.save(ium)
    
    iu = model.ItemUnit()
    iu.name = u'เม็ด'
    s.save(iu)
    
    iu = model.ItemUnit()
    iu.name = u'ขวด'
    s.save(iu)
    
    
    itmed = model.ItemType()
    itmed.name = u'ยา'
    s.save(itmed)
    
    itact = model.ItemType()
    itact.name = u'กิจกรรม'
    s.save(itact)
    
    itlab = model.ItemType()
    itlab.name = u'แล็บ'
    s.save(itlab)
    
    it = model.Item()
    it.name = u'ยาแก้ไข้'
    it.item_type = itmed
    it.item_unit = ium
    it.price = 20
    it.show_in_receipt = True
    s.save(it)
    
    it = model.Item()
    it.name = u'x-ray'
    it.item_type = itlab
    it.item_unit = iut
    it.price = 300
    it.show_in_receipt = True
    s.save(it)
    
    it = model.Item()
    it.name = u'ปลูกข้าว'
    it.item_type = itact
    it.item_unit = iut
    it.price = 200
    it.show_in_receipt = True
    s.save(it)
    
    ua = model.UserAccount()
    ua.name = 'user1'
    ua.password = '1111'
    s.save(ua)
    
    ua = model.UserAccount()
    ua.name = 'user2'
    ua.password = '2222'
    s.save(ua)

    cg = model.CompleteGroup()
    cg.id = 1
    cg.name = u'อาการสำคัญ'
    s.save(cg)
    
    tc = model.TextComplete()
    tc.text = 'a0001'
    tc.group = cg
    s.save(tc)
    
    tc = model.TextComplete()
    tc.text = 'a0002'
    tc.group = cg
    s.save(tc)
    
    tc = model.TextComplete()
    tc.text = 'b0001'
    tc.group = cg
    s.save(tc)
    
    tc = model.TextComplete()
    tc.text = 'b00002'
    tc.group = cg
    s.save(tc)
    
    tc = model.TextComplete()
    tc.text = 'c00001'
    tc.group = cg
    s.save(tc)
    
    tc = model.TextComplete()
    tc.text = 'c00002'
    tc.group = cg
    s.save(tc)
    
    cg = model.CompleteGroup()
    cg.id = 2
    cg.name = u'การรักษา'
    s.save(cg)
    
    tc = model.TextComplete()
    tc.text = 'a00001-cure'
    tc.group = cg
    s.save(tc)
    
    tc = model.TextComplete()
    tc.text = 'aaaa-cure'
    tc.group = cg
    s.save(tc)
    
    tc = model.TextComplete()
    tc.text = 'bbbbbb-cure'
    tc.group = cg
    s.save(tc)
    
    tc = model.TextComplete()
    tc.text = 'bbbb1-cure'
    tc.group = cg
    s.save(tc)
    
    tc = model.TextComplete()
    tc.text = 'abcde-cure'
    tc.group = cg
    s.save(tc)
    
    tc = model.TextComplete()
    tc.text = 'b1b2-cure'
    tc.group = cg
    s.save(tc)
    
    tc = model.TextComplete()
    tc.text = 'xyz-cure'
    tc.group = cg
    s.save(tc)
    
    cg = model.CompleteGroup()
    cg.id = 3
    cg.name = u'บุคลิกภาพ'
    s.save(cg)
    
    tc = model.TextComplete()
    tc.text = 'abc-person'
    tc.group = cg
    s.save(tc)
    
    tc = model.TextComplete()
    tc.text = 'def-person'
    tc.group = cg
    s.save(tc)
    
    tc = model.TextComplete()
    tc.text = 'aaa-person'
    tc.group = cg
    s.save(tc)
    
    cg = model.CompleteGroup()
    cg.id = 4
    cg.name = u'การวินิจฉัยทางสังคม'
    s.save(cg)
    
    tc = model.TextComplete()
    tc.text = 'aaa1-social'
    tc.group = cg
    s.save(tc)
    
    
    tc = model.TextComplete()
    tc.text = 'bbb-social'
    tc.group = cg
    s.save(tc)
    
    
    tc = model.TextComplete()
    tc.text = 'aaa2-social'
    tc.group = cg
    s.save(tc)
    
    tc = model.TextComplete()
    tc.text = 'aaa3-social'
    tc.group = cg
    s.save(tc)
    
    cg = model.CompleteGroup()
    cg.id = 5
    cg.name = u'การให้ความช่วยเหลือ'
    s.save(cg)
    
    tc = model.TextComplete()
    tc.text = 'abcde1-help'
    tc.group = cg
    s.save(tc)
    
    tc = model.TextComplete()
    tc.text = 'abcdefg-help'
    tc.group = cg
    s.save(tc)
    
    tc = model.TextComplete()
    tc.text = 'abc-help'
    tc.group = cg
    s.save(tc)
    
    tc = model.TextComplete()
    tc.text = 'abcdefghij-help'
    tc.group = cg
    s.save(tc)
        
    s.commit()