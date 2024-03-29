﻿# -*- coding: utf-8 -*-
import sqlalchemy as sa
from string import split
from sqlalchemy import Table, Column, ForeignKey
from sqlalchemy import orm
import sqlalchemy.types as t
from sqlalchemy.sql import and_, or_, not_, select, func, join, between
from datetime import datetime, date, timedelta, time
from sqlalchemy.schema import PassiveDefault
from sqlalchemy.sql.expression import text, case
from srjvkk.lib.helpers import stringornone
from math import ceil
import calendar

#engine = None
#Session = None

def init_model(config, bind):
    """Call me at the beginning of the application.
       'bind' is a SQLAlchemy engine or connection, as returned by
       sa.create_engine, sa.engine_from_config, or engine.connect().
    """
    if(globals().has_key('engine')): return
    global engine, Session

    engine = bind if bind else None
    Session = orm.scoped_session(
        orm.sessionmaker(transactional=True, autoflush=True, bind=bind))
    #load other modules's tables.

# --------------------------
# Medrec Mapper
# --------------------------
    orm.mapper(HospitalCode, nano_hospital_code_tb)
    orm.mapper(DischargeSelect, discharge_select_tb)
    orm.mapper(Province, province_tb)

    orm.mapper(Occupation, occupation_tb)

    orm.mapper(MarriageStatus, marriage_status_tb)

    orm.mapper(Education, education_tb)

    orm.mapper(DischargeActivity, discharge_activity_tb)

    orm.mapper(Visit, visit_tb, properties = {
            'patient':orm.relation(Patient, uselist=False, primaryjoin=visit_tb.c.id_patient==patient_tb.c.id,
                foreign_keys=[visit_tb.c.id_patient]),
            'privilege':orm.relation(Privilege, uselist=False, primaryjoin=visit_tb.c.privilege_id==privilege_tb.c.id,
                foreign_keys=[visit_tb.c.privilege_id]),
            'icd10s':orm.relation(NeuralOrderIcd10, uselist=True,
                primaryjoin=visit_tb.c.id==neural_order_icd10_tb.c.visit_id,
                foreign_keys=[neural_order_icd10_tb.c.visit_id]),
            'admit_main':orm.relation(AdmitMain, uselist=False, primaryjoin=admit_main_tb.c.an==visit_tb.c.an,
                foreign_keys=[admit_main_tb.c.an]),
            'ipd_main':orm.relation(IpdMain, uselist=False, primaryjoin=ipd_main_tb.c.an==visit_tb.c.an,
                foreign_keys=[visit_tb.c.an]),
            'home_visits':orm.relation(IpdHomeVisit, uselist=True, primaryjoin=ipd_home_visit_tb.c.an==visit_tb.c.an,
                foreign_keys=[visit_tb.c.an]),
            'doctor':orm.relation(User, uselist=False, primaryjoin=user_tb.c.id==visit_tb.c.doctor_id,
                foreign_keys=[visit_tb.c.doctor_id]),
            'queue':orm.relation(PatientQueue, uselist=False, primaryjoin=queue_tb.c.vn_id==visit_tb.c.id,
                foreign_keys=[queue_tb.c.vn_id])
        })

    # For each table and class, add the mapping here.
    orm.mapper(Patient, patient_tb, properties = {
            'background':orm.relation(PatientBackground, uselist=False, primaryjoin=background_tb.c.patient_id==patient_tb.c.id,
                foreign_keys=[background_tb.c.patient_id]),
            #'addresses':orm.relation(PatientAddress, backref='patient', primaryjoin=patient_tb.c.hn==address_tb.c.hn,
            #    foreign_keys=[address_tb.c.hn]),
            'privilege':orm.relation(Privilege, uselist=False, primaryjoin=privilege_tb.c.id==patient_tb.c.pa_privilege_id,
                foreign_keys=[patient_tb.c.pa_privilege_id]),
            'nitis':orm.relation(PatientNiti, uselist=True, primaryjoin=niti_tb.c.patient_id==patient_tb.c.id,
                foreign_keys=[niti_tb.c.patient_id]),
            'admit_mains':orm.relation(AdmitMain, uselist=True, primaryjoin=admit_main_tb.c.hn==patient_tb.c.hn,
                foreign_keys=[admit_main_tb.c.hn]),
            'ipd_mains':orm.relation(IpdMain, uselist=True, primaryjoin=ipd_main_tb.c.hn==patient_tb.c.hn,
                foreign_keys=[ipd_main_tb.c.hn]),
            'province':orm.relation(Province, uselist=False, primaryjoin=province_tb.c.pro_code==patient_tb.c.chwpart,
                foreign_keys=[patient_tb.c.chwpart]),
            #'visit':orm.relation(Visit, uselist=False, primaryjoin=visit_tb.c.id_patient==patient_tb.c.id,
            #    foreign_keys=[visit_tb.c.id_patient])
            })

    orm.mapper(PatientAddress, address_tb)

# --------------------------
# JVKK Mapper
# --------------------------

    #orm.mapper(Province, province_tb)

    #orm.mapper(Job, job_tb)
    orm.mapper(SysHoliday, sys_holiday_tb)
    orm.mapper(UserGroup, user_group_tb)
    orm.mapper(User, user_tb, properties = {
        'group':orm.relation(UserGroup, uselist=False,
            primaryjoin=user_group_tb.c.id==user_tb.c.group_id,
            foreign_keys=[user_tb.c.group_id])
    })
    #orm.mapper(Education, education_tb)
    #orm.mapper(MarriageStatus, marriage_status_tb)
    orm.mapper(NeuralAction, neural_action_tb, properties = {
        'component':orm.relation(Component, uselist=False,
            primaryjoin=neural_action_tb.c.com_id==component_tb.c.id,
            foreign_keys=[neural_action_tb.c.com_id])

    })

    orm.mapper(NeuralComponentAction, neural_component_action_tb, properties = {
        'component':orm.relation(Component, uselist=False,
            primaryjoin=neural_component_action_tb.c.com_id==component_tb.c.id,
            foreign_keys=[neural_component_action_tb.c.com_id]),
        'action':orm.relation(NeuralAction, uselist=False,
            primaryjoin=neural_component_action_tb.c.action_id==neural_action_tb.c.id,
            foreign_keys=[neural_component_action_tb.c.action_id])
    })

    orm.mapper(ComponentPermission, component_permission_tb)
    orm.mapper(ModulePermission, component_module_tb, properties = {
        'module':orm.relation(Module, uselist=False, primaryjoin=component_module_tb.c.permmod_mod==module_tb.c.id,
            foreign_keys=[component_module_tb.c.permmod_mod]),
    })

    orm.mapper(CompletionGroup, completion_group_tb, properties = {
            'completions':orm.relation(TextCompletion, backref='group')
            })
    orm.mapper(TextCompletion, text_completion_tb)

    orm.mapper(UserSession, session_tb, properties = {
            'user':orm.relation(User, uselist=False,
                primaryjoin=user_tb.c.id==session_tb.c.session_user_id,
                foreign_keys=[session_tb.c.session_user_id],
                backref='sessions')
            })
    orm.mapper(Module, module_tb, properties = {
            'components':orm.relation(Component, secondary=component_module_tb)})
    orm.mapper(Component, component_tb, properties = {
            'modules':orm.relation(Module, secondary=component_module_tb)})
    orm.mapper(PatientQueue, queue_tb, properties = {
            'visit':orm.relation(Visit, uselist=False,
                primaryjoin=visit_tb.c.id==queue_tb.c.vn_id,
                foreign_keys=[queue_tb.c.vn_id]),
            'com1o':orm.relation(Component, uselist=False,
                primaryjoin=component_tb.c.id==queue_tb.c.com_id1,
                foreign_keys=[queue_tb.c.com_id1]),
            'user1o':orm.relation(User, uselist=False,
                primaryjoin=user_tb.c.id==queue_tb.c.user1,
                foreign_keys=[queue_tb.c.user1]),
            'actiono':orm.relation(NeuralAction, uselist=False,
                primaryjoin=neural_action_tb.c.id==queue_tb.c.action_id,
                foreign_keys=[queue_tb.c.action_id]),
            'com2o':orm.relation(Component, uselist=False,
                primaryjoin=component_tb.c.id==queue_tb.c.com_id2,
                foreign_keys=[queue_tb.c.com_id2]),
            'user2o':orm.relation(User, uselist=False,
                primaryjoin=user_tb.c.id==queue_tb.c.user2,
                foreign_keys=[queue_tb.c.user2]),
            'com3o':orm.relation(Component, uselist=False,
                primaryjoin=component_tb.c.id==queue_tb.c.com_id3,
                foreign_keys=[queue_tb.c.com_id3]),
            'action3o':orm.relation(NeuralAction, uselist=False,
                primaryjoin=neural_action_tb.c.id==queue_tb.c.action_id3,
                foreign_keys=[queue_tb.c.action_id3]),

            })

    orm.mapper(DoneQueue, donequeue_tb, properties = {
            'visit':orm.relation(Visit, uselist=False,
                primaryjoin=visit_tb.c.id==donequeue_tb.c.vn_id,
                foreign_keys=[donequeue_tb.c.vn_id]),
            'com1o':orm.relation(Component, uselist=False,
                primaryjoin=component_tb.c.id==donequeue_tb.c.com_id1,
                foreign_keys=[donequeue_tb.c.com_id1]),
            'user1o':orm.relation(User, uselist=False,
                primaryjoin=user_tb.c.id==donequeue_tb.c.user1,
                foreign_keys=[donequeue_tb.c.user1]),
            'actiono':orm.relation(NeuralAction, uselist=False,
                primaryjoin=neural_action_tb.c.id==donequeue_tb.c.action_id,
                foreign_keys=[donequeue_tb.c.action_id]),
            'com2o':orm.relation(Component, uselist=False,
                primaryjoin=component_tb.c.id==donequeue_tb.c.com_id2,
                foreign_keys=[donequeue_tb.c.com_id2]),
            'comto':orm.relation(Component, uselist=False,
                primaryjoin=component_tb.c.id==donequeue_tb.c.transfer_to,
                foreign_keys=[donequeue_tb.c.transfer_to]),
            'user2o':orm.relation(User, uselist=False,
                primaryjoin=user_tb.c.id==donequeue_tb.c.user2,
                foreign_keys=[donequeue_tb.c.user2])
            })
    orm.mapper(QueueLog, queue_log_tb)

    orm.mapper(Rundoc, sr_rundoc_tb)

# --------------------------
# Drug Mapper
# --------------------------
    orm.mapper(Drug, drug_tb)

# --------------------------
# Admit Mapper
# --------------------------
    orm.mapper(AdmitMain, admit_main_tb, properties = {
            'building':orm.relation(Building, uselist=False,
                primaryjoin=building_tb.c.building_id==admit_main_tb.c.building_id,
                foreign_keys=[admit_main_tb.c.building_id]),
            'visit':orm.relation(Visit, uselist=False, primaryjoin=admit_main_tb.c.an==visit_tb.c.an,
                foreign_keys=[admit_main_tb.c.an]),
                })

# --------------------------
# IPD Mapper
# --------------------------
    orm.mapper(Building, building_tb)

    orm.mapper(IpdMain, ipd_main_tb, properties = {
            'ipdbuilding':orm.relation(Building, uselist=False,
                primaryjoin=building_tb.c.building_id==ipd_main_tb.c.building,
                foreign_keys=[ipd_main_tb.c.building]),
            'visit':orm.relation(Visit, uselist=False, primaryjoin=ipd_main_tb.c.an==visit_tb.c.an,
                foreign_keys=[ipd_main_tb.c.an]),
            'detail':orm.relation(IpdGenDetail, uselist=False,
                primaryjoin=ipd_gen_detail_tb.c.id==ipd_main_tb.c.auto_id,
                foreign_keys=[ipd_gen_detail_tb.c.id]),
    })

    orm.mapper(IpdHomeVisit, ipd_home_visit_tb)
    orm.mapper(IpdGenDetail, ipd_gen_detail_tb)


# --------------------------
# Social Mapper
# --------------------------

    orm.mapper(HelpMethod, help_method_tb)

    orm.mapper(SocialProblem, social_problem_tb)

    orm.mapper(HealthStation, health_station_tb)

    orm.mapper(HelpReason, help_reason_tb)

    orm.mapper(RequestReason, request_reason_tb)

    orm.mapper(SocialPatientInfo, social_patient_info_tb, properties = {
        'patient':orm.relation(Patient, uselist=False, primaryjoin=social_patient_info_tb.c.patient_id==patient_tb.c.id,
            foreign_keys=[social_patient_info_tb.c.patient_id]),
        'province':orm.relation(Province, uselist=False, primaryjoin=social_patient_info_tb.c.province_id==province_tb.c.pro_id,
            foreign_keys=[social_patient_info_tb.c.province_id]),
        'education':orm.relation(Education, uselist=False, primaryjoin=social_patient_info_tb.c.education_id==education_tb.c.id,
            foreign_keys=[social_patient_info_tb.c.education_id]),
        'occupation':orm.relation(Occupation, uselist=False, primaryjoin=social_patient_info_tb.c.occupation_id==occupation_tb.c.id,
            foreign_keys=[social_patient_info_tb.c.occupation_id]),
        'status':orm.relation(MarriageStatus, uselist=False, primaryjoin=social_patient_info_tb.c.marriage_status_id==marriage_status_tb.c.id,
            foreign_keys=[social_patient_info_tb.c.marriage_status_id])
    })

    orm.mapper(PatientBackground, background_tb, properties = {
            #'healthStation':orm.relation(HealthStation, uselist=False),
            'helps':orm.relation(BackgroundHelp),
            'problems':orm.relation(BackgroundProblem),
            'patient':orm.relation(Patient, uselist=False, primaryjoin=background_tb.c.patient_id==patient_tb.c.id,
                foreign_keys=[background_tb.c.patient_id])
        })

    orm.mapper(BackgroundHelp, background_help_tb, properties = {
            'background':orm.relation(PatientBackground, uselist=False),
            'help':orm.relation(HelpMethod, uselist=False)
        })

    orm.mapper(BackgroundProblem, background_problem_tb, properties = {
            'background':orm.relation(PatientBackground, uselist=False),
            'problem':orm.relation(SocialProblem, uselist=False)
        })

    orm.mapper(PatientNiti, niti_tb, properties = {
            'helps':orm.relation(NitiHelp),
            'problems':orm.relation(NitiProblem),
            'patient':orm.relation(Patient, uselist=False, primaryjoin=niti_tb.c.patient_id==patient_tb.c.id,
                foreign_keys=[niti_tb.c.patient_id])
        })

    orm.mapper(NitiHelp, niti_help_tb, properties = {
            'help':orm.relation(HelpMethod, uselist=False),
            'niti':orm.relation(PatientNiti, uselist=False)
        })

    orm.mapper(NitiProblem, niti_problem_tb, properties = {
            'problem':orm.relation(SocialProblem, uselist=False),
            'niti':orm.relation(PatientNiti, uselist=False)
        })

    orm.mapper(SocialSupport, social_support_tb, properties = {
            'visit':orm.relation(Visit, uselist=False),
            'patient':orm.relation(Patient, uselist=False, primaryjoin=social_support_tb.c.patient_id==patient_tb.c.id,
                        foreign_keys=[social_support_tb.c.patient_id]),
            'receipt':orm.relation(ReceiptH, uselist=False)
            #'details':orm.relation(SocialSupportD, backref='header')
            #'province':orm.relation(Province, uselist=False),
            #'education':orm.relation(Education, uselist=False),
            #'job':orm.relation(Job, uselist=False),
            #'request_reason':orm.relation(Patient, uselist=False),
            #'help_reason':orm.relation(Patient, uselist=False)
        })
    orm.mapper(SocialSupportItem, social_support_item_tb, properties = {
           'support':orm.relation(SocialSupport, uselist=False),
           'group':orm.relation(ItemGroup, uselist=False)
        })

    #orm.mapper(SocialSupportD, social_support_d_tb, properties = {
    #        'item':orm.relation(Item, uselist=False),
    #       'unit':orm.relation(ItemUnit, uselist=False)
    #    })

# --------------------------
# Finance Mapper
# --------------------------

    orm.mapper(SendMoney, send_money_tb, properties = {
        'station':orm.relation(Station, uselist=False)
    })

    orm.mapper(SendMoneyItem, send_money_item_tb, properties = {
        'send_money':orm.relation(SendMoney, uselist=False, backref='send_items'),
        'group':orm.relation(ItemGroup, uselist=False),
    })

    orm.mapper(Item, item_tb)
#    orm.mapper(ItemOrder, item_order_tb, properties = {
#            'visit':orm.relation(Visit, uselist=False, backref='item_orders'),
#            'item':orm.relation(Item, uselist=False, backref='item_orders'),
#            'unit':orm.relation(ItemUnit, uselist=False, backref='item_orders')
#            })

    orm.mapper(ItemGroup, item_group_tb, properties = {
            'items':orm.relation(Item, backref='group')
            })
    orm.mapper(ItemUnit, item_unit_tb, properties = {
            'items':orm.relation(Item, backref='unit')
            })

    orm.mapper(Privilege, privilege_tb)
    orm.mapper(Station, station_tb)
    orm.mapper(Q4utoken, q4u_token_tb)

    orm.mapper(ReceiptH, receipt_h_tb, properties = {
        'visit':orm.relation(Visit, uselist=False, backref='receipts'),
        'patient':orm.relation(Patient, uselist=False, primaryjoin=receipt_h_tb.c.pa_id==patient_tb.c.id,
            foreign_keys=[receipt_h_tb.c.pa_id]),
        'support':orm.relation(SocialSupport, uselist=False, backref='receipts'),
        'privilege':orm.relation(Privilege, uselist=False, backref='receipts'),
        'station':orm.relation(Station, uselist=False),
        'sendmoney':orm.relation(SendMoney, uselist=False),
    })

    orm.mapper(ReceiptOrder, receipt_order_tb, properties = {
        'receipth':orm.relation(ReceiptH, uselist=False, backref='receipt_orders'),
        'order':orm.relation(NeuralOrder, uselist=False,
                primaryjoin=receipt_order_tb.c.order_id==neural_order_tb.c.id,
                foreign_keys=[receipt_order_tb.c.order_id])
    })

    orm.mapper(ReceiptD, receipt_d_tb, properties = {
        'receipth':orm.relation(ReceiptH, uselist=False, backref='receiptds'),
        'item':orm.relation(Item, uselist=False)
    })

    orm.mapper(SpecialItemSubsidy, special_item_subsidy_tb, properties = {
         'privilege':orm.relation(Privilege, uselist=False, backref='specials'),
         'item':orm.relation(Item, uselist=False)
    })
# --------------------------
# Psyco Mapper
# --------------------------
    orm.mapper(PsycoTool, psyco_tool_tb)
#    orm.mapper(PsycoTestReqH, psyco_test_req_h_tb, properties = {
#        'patient':orm.relation(Patient, uselist=False, primaryjoin=psyco_test_req_h_tb.c.patient_id==patient_tb.c.id,
#            foreign_keys=[psyco_test_req_h_tb.c.patient_id]),
#        'req_person':orm.relation(User, uselist=False),
#        'visit':orm.relation(Visit, uselist=False)
#    })
#
#    orm.mapper(PsycoTestReqD, psyco_test_req_d_tb, properties = {
#        'item':orm.relation(Item, uselist=False),
#        'unit':orm.relation(ItemUnit, uselist=False)
#    })

    orm.mapper(PsycoTestReason, test_reason_tb)

    orm.mapper(PsycoReqTestReason, req_test_reason_tb, properties = {
        'order':orm.relation(NeuralOrder, uselist=False,
                 primaryjoin=req_test_reason_tb.c.order_id==neural_order_tb.c.id,
                 foreign_keys=[req_test_reason_tb.c.order_id]),
        'reason':orm.relation(PsycoTestReason, uselist=False,
                 primaryjoin=req_test_reason_tb.c.reason_id==test_reason_tb.c.id,
                 foreign_keys=[req_test_reason_tb.c.reason_id])
    })

    orm.mapper(PsycoTestResult, psyco_test_result_tb, properties = {
        'order':orm.relation(NeuralOrder, uselist=False,
                 primaryjoin=psyco_test_result_tb.c.order_id==neural_order_tb.c.id,
                 foreign_keys=[psyco_test_result_tb.c.order_id])
    })

    orm.mapper(PsycoTestToolUsed, psyco_test_tool_used_tb, properties = {
        'result':orm.relation(PsycoTestResult, uselist=False, backref='usedtools'),
        'tool':orm.relation(PsycoTool, uselist=False)
    })

# --------------------------
# Frontmed Mapper
# --------------------------
    orm.mapper(NeuralAppointment, neural_appointment_tb, properties= {
        'patient':orm.relation(Patient, uselist=False,
                primaryjoin=patient_tb.c.id==neural_appointment_tb.c.patient_id,
                foreign_keys=[neural_appointment_tb.c.patient_id]),
        'appointto':orm.relation(User, uselist=False,
                primaryjoin=neural_appointment_tb.c.user_id==user_tb.c.id,
                foreign_keys=[neural_appointment_tb.c.user_id])
    })

# --------------------------
# Med Mapper
# --------------------------
    orm.mapper(NeuralIcd10, neural_icd10_tb)

    orm.mapper(NeuralOrderIcd10, neural_order_icd10_tb, properties={
        'visit':orm.relation(Visit, uselist=False,
                primaryjoin=visit_tb.c.id==neural_order_icd10_tb.c.visit_id,
                foreign_keys=[neural_order_icd10_tb.c.visit_id]),
        'order':orm.relation(NeuralOrder, uselist=False,
                primaryjoin=neural_order_tb.c.id==neural_order_icd10_tb.c.order_id,
                foreign_keys=[neural_order_icd10_tb.c.order_id]),
        'icd10':orm.relation(NeuralIcd10, uselist=False,
                primaryjoin=neural_icd10_tb.c.id==neural_order_icd10_tb.c.icd10_id,
                foreign_keys=[neural_order_icd10_tb.c.icd10_id])
    })

    orm.mapper(NeuralOrder, neural_order_tb, properties={
        'visit':orm.relation(Visit, uselist=False,
                primaryjoin=visit_tb.c.id==neural_order_tb.c.vn_id,
                foreign_keys=[neural_order_tb.c.vn_id]),
        'patient':orm.relation(Patient, uselist=False,
                primaryjoin=patient_tb.c.id==neural_order_tb.c.pa_id,
                foreign_keys=[neural_order_tb.c.pa_id]),
        'user':orm.relation(User, uselist=False,
                primaryjoin=user_tb.c.id==neural_order_tb.c.user_id,
                foreign_keys=[neural_order_tb.c.user_id]),
        'psyco_result':orm.relation(PsycoTestResult, uselist=False,
                primaryjoin=psyco_test_result_tb.c.id==neural_order_tb.c.psyco_result_id,
                foreign_keys=[neural_order_tb.c.psyco_result_id]),
        'cure_result':orm.relation(PsycoTestResult, uselist=False,
                primaryjoin=psyco_test_result_tb.c.id==neural_order_tb.c.cure_result_id,
                foreign_keys=[neural_order_tb.c.cure_result_id]),
        'order_items':orm.relation(NeuralOrderItem,
                primaryjoin=neural_order_item_tb.c.order_id==neural_order_tb.c.id,
                foreign_keys=[neural_order_item_tb.c.order_id]),
        'icd10s':orm.relation(NeuralOrderIcd10,
                primaryjoin=neural_order_icd10_tb.c.order_id==neural_order_tb.c.id,
                foreign_keys=[neural_order_icd10_tb.c.order_id]),
    })

    orm.mapper(NeuralOrderItem, neural_order_item_tb, properties={
        'order':orm.relation(NeuralOrder, uselist=False,
                primaryjoin=neural_order_item_tb.c.order_id==neural_order_tb.c.id,
                foreign_keys=[neural_order_item_tb.c.order_id]),
        'item':orm.relation(Item, uselist=False,
                primaryjoin=item_tb.c.id==neural_order_item_tb.c.item_id,
                foreign_keys=[neural_order_item_tb.c.item_id]),
        'unit':orm.relation(ItemUnit, uselist=False,
                primaryjoin=item_unit_tb.c.id==neural_order_item_tb.c.unit_id,
                foreign_keys=[neural_order_item_tb.c.unit_id]),
        'records':orm.relation(NeuralRecord,
                primaryjoin=neural_order_item_tb.c.id==neural_record_tb.c.order_item_id,
                foreign_keys=[neural_record_tb.c.order_item_id])
    })

    orm.mapper(NeuralRecord, neural_record_tb, properties={
        'visit':orm.relation(Visit, uselist=False,
                primaryjoin=visit_tb.c.id==neural_record_tb.c.vn_id,
                foreign_keys=[neural_record_tb.c.vn_id]),
        'order_item':orm.relation(NeuralOrderItem, uselist=False,
                primaryjoin=neural_order_item_tb.c.id==neural_record_tb.c.order_item_id,
                foreign_keys=[neural_record_tb.c.order_item_id])
        #'item':orm.relation(Item, uselist=False,
        #        primaryjoin=item_tb.c.id==neural_record_tb.c.item_id,
        #        foreign_keys=[neural_record_tb.c.item_id]),
        #'unit':orm.relation(ItemUnit, uselist=False,
        #        primaryjoin=item_unit_tb.c.id==neural_record_tb.c.unit_id,
        #        foreign_keys=[neural_record_tb.c.unit_id]),
        #'privilege':orm.relation(Privilege, uselist=False,
        #        primaryjoin=privilege_tb.c.id==neural_record_tb.c.privilege_id,
        #        foreign_keys=[neural_record_tb.c.privilege_id])
    })

# --------------------------
# Xray Mapper
# --------------------------
    orm.mapper(XrayPart, xray_part_tb)
    orm.mapper(XrayXray, xray_xray_tb, properties={
        'parts': orm.relation(XrayXrayPart),
        'patient': orm.relation(Patient, uselist=False),
        'visit': orm.relation(Visit, uselist=False)
    })
    orm.mapper(XrayEEG, xray_eeg_tb, properties={
        'patient': orm.relation(Patient, uselist=False),
        'visit': orm.relation(Visit, uselist=False)
    })
    orm.mapper(XrayEKG, xray_ekg_tb, properties={
        'patient': orm.relation(Patient, uselist=False),
        'visit': orm.relation(Visit, uselist=False)
    })
    orm.mapper(XrayXrayPart, xray_xray_part_tb, properties={
        'part': orm.relation(XrayPart, uselist=False),
        'xray': orm.relation(XrayXray, uselist=False),
    })

# --------------------------
# Zone Mapper
# --------------------------
    orm.mapper(ZoneProvince, zone_province_tb)
    orm.mapper(ZoneAmpur, zone_ampur_tb)
    orm.mapper(ZoneTambon, zone_tambon_tb)
    orm.mapper(ZoneSymptom, zone_symptom_tb)
    orm.mapper(ZonePersonality, zone_personality_tb)
    orm.mapper(ZoneStressManagement, zone_stress_management_tb)
    orm.mapper(ZoneReason, zone_reason_tb)
    orm.mapper(ZoneVisitSymptom, zone_visit_symptom_tb)
    orm.mapper(ZoneCondition, zone_condition_tb)
    orm.mapper(ZoneNewProblem, zone_new_problem_tb)
    #orm.mapper(ZoneDisease, zone_disease_tb)
    orm.mapper(ZoneMonitoring, zone_monitoring_tb)
    orm.mapper(ZoneObjective, zone_objective_tb)
    orm.mapper(ZoneProblem, zone_problem_tb)
    orm.mapper(ZoneTool, zone_tool_tb)

    orm.mapper(ZoneRefer, zone_refer_tb, properties={
        #'visit':orm.relation(Visit, uselist=False),
        'patient':orm.relation(Patient, uselist=False),
        'results': orm.relation(ZoneReferResult),
        'networks': orm.relation(ZoneReferNetwork),
        'monitor': orm.relation(ZoneMonitoring, uselist=False),
        'relative': orm.relation(ZoneReferRelative, uselist=False),
        'tools': orm.relation(ZoneReferTool),
    })

    orm.mapper(ZoneReferNetwork, zone_refer_network_tb, properties={
        'refer': orm.relation(ZoneRefer, uselist=False)
    })

    orm.mapper(ZoneReferTool, zone_refer_tool_tb, properties={
        'refer': orm.relation(ZoneRefer, uselist=False),
        'tool': orm.relation(ZoneTool, uselist=False),
    })


    orm.mapper(ZoneRequestTool, zone_request_tool_tb, properties={
        'request': orm.relation(ZoneVisitRequest, uselist=False),
        'tool': orm.relation(ZoneTool, uselist=False),
    })

    orm.mapper(ZoneReferRelative, zone_refer_relative_tb, properties={
        'refer': orm.relation(ZoneRefer, uselist=False)
    })

    orm.mapper(ZoneReferResult, zone_refer_result_tb, properties={
        'refer': orm.relation(ZoneRefer, uselist=False),
    })


    orm.mapper(ZoneRequestProblem, zone_request_problem_tb, properties={
        'request':orm.relation(ZoneVisitRequest, uselist=False),
    })

    orm.mapper(ZoneVisitRequest, zone_visit_request_tb, properties={
        #'visit':orm.relation(Visit, uselist=False),
        'patient':orm.relation(Patient, uselist=False),
        'conditions': orm.relation(ZoneVisitCondition),
        'results':orm.relation(ZoneVisitResult),
        'problems':orm.relation(ZoneRequestProblem),
        'new_problems':orm.relation(ZoneVisitProblem),
        'user':orm.relation(User, uselist=False,
            primaryjoin=user_tb.c.id==zone_visit_request_tb.c.updated_by,
            foreign_keys=[zone_visit_request_tb.c.updated_by]),
        'tools': orm.relation(ZoneRequestTool),
    })

    orm.mapper(ZoneVisitCondition, zone_visit_condition_tb, properties={
        'request':orm.relation(ZoneVisitRequest, uselist=False),
        'condition': orm.relation(ZoneCondition, uselist=False)
    })



    orm.mapper(ZoneVisitProblem, zone_visit_problem_tb, properties={
        'request':orm.relation(ZoneVisitRequest, uselist=False),
        'problem': orm.relation(ZoneNewProblem, uselist=False)
    })

    orm.mapper(ZoneVisitFamily, zone_visit_family_tb, properties={
        'result':orm.relation(ZoneVisitResult, uselist=False),
    })
    orm.mapper(ZoneVisitHelp, zone_visit_help_tb, properties={
        'result':orm.relation(ZoneVisitResult, uselist=False),
    })
    orm.mapper(ZoneVisitLeader, zone_visit_leader_tb, properties={
        'result':orm.relation(ZoneVisitResult, uselist=False),
    })
    orm.mapper(ZoneVisitObjective, zone_visit_objective_tb, properties={
        'result':orm.relation(ZoneVisitResult, uselist=False),
    })
    orm.mapper(ZoneVisitPersonality, zone_visit_personality_tb, properties={
        'result':orm.relation(ZoneVisitResult, uselist=False),
    })
    orm.mapper(ZoneVisitReason, zone_visit_reason_tb, properties={
        'result':orm.relation(ZoneVisitResult, uselist=False),
    })
    orm.mapper(ZoneVisitStress, zone_visit_stress_tb, properties={
        'result':orm.relation(ZoneVisitResult, uselist=False),
    })
    orm.mapper(ZoneVisitResult, zone_visit_result_tb, properties={
        #'visit':orm.relation(Visit, uselist=False),
        'patient':orm.relation(Patient, uselist=False),
        'request':orm.relation(ZoneVisitRequest, uselist=False),
        'reasons':orm.relation(ZoneVisitReason),
        'stresses':orm.relation(ZoneVisitStress),
        'personalities':orm.relation(ZoneVisitPersonality),
        'objectives':orm.relation(ZoneVisitObjective),
    })

    orm.mapper(ZoneResultVisitor, zone_result_visitor_tb, properties={
        'result':orm.relation(ZoneVisitResult, uselist=False)
    })

# --------------------------
# Psychosocial Mapper
# --------------------------
    orm.mapper(PSType, ps_type_tb)
    orm.mapper(PSDrug, ps_drug_tb)
    orm.mapper(PSMethod, ps_method_tb, properties={
        'parent':orm.relation(PSMethod, uselist=False,
                primaryjoin=ps_method_tb.c.id==ps_method_tb.c.parent_id,
                foreign_keys=[ps_method_tb.c.parent_id]),
        'children':orm.relation(PSMethod,
                primaryjoin=ps_method_tb.c.id==ps_method_tb.c.parent_id,
                foreign_keys=[ps_method_tb.c.parent_id])
    })
    orm.mapper(PSAssessment, ps_assessment_tb)
    orm.mapper(PSCancelReason, ps_cancel_reason_tb)
    orm.mapper(PSEntrance, ps_entrance_tb)
    orm.mapper(PSFollowup, ps_followup_tb)
    orm.mapper(PSResult, ps_result_tb)
    orm.mapper(PSNumber, ps_number_tb)
    orm.mapper(PSTreatmentAssessment, ps_treatment_assessment_tb, properties={
        'assessment':orm.relation(PSAssessment, uselist=False),
        'pa_assessment':orm.relation(PSPatientAssessment, uselist=False),
     })
    orm.mapper(PSPatientAssessment, ps_patient_assessment_tb, properties = {
        'visit':orm.relation(Visit, uselist=False),
        'patient':orm.relation(Patient, uselist=False),
        'entrance':orm.relation(PSEntrance, uselist=False),
        'assessments':orm.relation(PSTreatmentAssessment),
        'as_result':orm.relation(PSAssessmentResult, uselist=False),
        'user':orm.relation(User, uselist=False,
            primaryjoin=user_tb.c.id==ps_patient_assessment_tb.c.updated_by,
            foreign_keys=[ps_patient_assessment_tb.c.updated_by])
    })

    orm.mapper(PSAssessmentResult, ps_assessment_result_tb, properties={
        'pa_assessment':orm.relation(PSPatientAssessment, uselist=False),
        'type':orm.relation(PSType, uselist=False),
        'number':orm.relation(PSNumber, uselist=False),
        'method':orm.relation(PSMethod, uselist=False),
        'cancel':orm.relation(PSCancelReason, uselist=False),
        'treatments':orm.relation(PSPatientTreatment),
        'follows':orm.relation(PSPatientFollowup),
        'plans':orm.relation(PSFollowingPlan)
    })

    orm.mapper(PSFollowingPlan, ps_following_plan_tb, properties={
        'result':orm.relation(PSAssessmentResult, uselist=False),
    })

    orm.mapper(PSPatientTreatment, ps_patient_treatment_tb, properties={
        'as_result':orm.relation(PSAssessmentResult, uselist=False),
        'treatments':orm.relation(PSTreatmentMethod),
        'user':orm.relation(User, uselist=False,
            primaryjoin=user_tb.c.id==ps_patient_treatment_tb.c.updated_by,
            foreign_keys=[ps_patient_treatment_tb.c.updated_by])
    })

    orm.mapper(PSTreatmentMethod, ps_treatment_method_tb, properties={
        'pa_treatment': orm.relation(PSPatientTreatment, uselist=False),
        'method':orm.relation(PSMethod, uselist=False),
    })

    orm.mapper(PSPatientFollowup, ps_patient_followup_tb, properties={
        'as_result':orm.relation(PSAssessmentResult, uselist=False),
        'patient':orm.relation(Patient, uselist=False),
        'follows':orm.relation(PSTreatmentFollowup),
        'user':orm.relation(User, uselist=False,
            primaryjoin=user_tb.c.id==ps_patient_followup_tb.c.updated_by,
            foreign_keys=[ps_patient_followup_tb.c.updated_by])
    })

    orm.mapper(PSTreatmentFollowup, ps_treatment_followup_tb, properties={
        'pa_follow':orm.relation(PSPatientFollowup),
        'follow':orm.relation(PSFollowup, uselist=False),
    })

#    orm.mapper(PSAssessmentResultMethod, ps_assessment_result_method_tb, properties={
#        'result':orm.relation(PSAssessmentResult, uselist=False),
#        'method':orm.relation(PSMethod, uselist=False),
#    })

    orm.mapper(PSAppointment, ps_appointment_tb, properties = {
        'patient':orm.relation(Patient, uselist=False),
    })

#    orm.mapper(PSTreatmentResult, ps_treatment_result_tb, properties = {
#        'patient':orm.relation(Patient, uselist=False),
#        'assessment_result':orm.relation(PSAssessmentResult, uselist=False),
#        'result':orm.relation(PSResult, uselist=False),
#        'cancel':orm.relation(PSCancelReason, uselist=False),
#    })

from pylons import config

meta = sa.MetaData(config['pylons.g'].sa_engine)
#Define table and class here.

# Common Sections Define from other modules
sch = config['jvkk.system_schema']
mrSch = config['jvkk.medrec_schema']
mSch = config['jvkk.med_schema']
fnSch = config['jvkk.finance_schema']
scSch = config['jvkk.social_schema']
pcSch = config['jvkk.psyco_schema']
iSch = config['jvkk.ipd_schema']
aSch = config['jvkk.admit_schema']
frSch = config['jvkk.frontmed_schema']
dSch = config['jvkk.drug_schema']
zSch = config['jvkk.zone_schema']
psSch = config['jvkk.ps_schema']
xSch = config['jvkk.xray_schema']
puSch = config['jvkk.public_schema']

def ss(str):
    return sch + '.' + str


# --------------------------
# Shifright internal utility Section
# --------------------------
class Rundoc(object):
    @staticmethod
    def rundoc(session, prefix):
        docs = session.query(Rundoc).filter_by(prefix=prefix).all()
        doc = Rundoc()
        if len(docs) > 0:
            doc = docs[0]
            doc.runno = doc.runno + 1
        else:
            doc.prefix = prefix
            doc.runno = 1
        session.save_or_update(doc)
        session.commit()
        no = doc.prefix + str.zfill(str(doc.runno), 3)
        return no

sr_rundoc_tb = Table('sr_rundoc', meta,
                Column('id', t.Integer(),
                    sa.Sequence('sr_rundoc_id_seq', optional=True),
                    primary_key=True),
                Column('prefix', t.String(20)),
                Column('runno', t.Integer()), schema=sch)

text_completion_tb = Table('sr_completion', meta,
                        Column('id', t.Integer(),
                             sa.Sequence('sr_completion_id_seq', optional=True),
                             primary_key=True),
                        Column('group_id', t.Integer(), ForeignKey(sch+'.'+'sr_completion_group.id')),
                        Column('name', t.String(125)), schema=sch)

completion_group_tb = Table('sr_completion_group', meta,
                        Column('id', t.Integer(), primary_key=True),
                        Column('name', t.String(100)), schema=sch)

class TextCompletion(object):
    def __str__(self):
        return '#<TextComplete: %s>' % (self.id,)

class CompletionGroup(object):
    def __str__(self):
        return '#<CompleteGroup: %s>' % (self.id,)


# --------------------------
# Shifright internal queue
# --------------------------
class DoneQueue(object):
    def copy(self, q, transfer_to, action_to, transfer_time, station_id):
        self.an = q.an
        self.user1 = q.user1
        self.user2 = q.user2
        self.time_send = q.time_send
        self.time_receive = q.time_receive
        self.action_id = q.action_id
        self.action = q.action
        self.com_id1 = q.com_id1
        self.com1 = q.com1o.com_name
        self.com_id2 = q.com_id2
        self.com2 = q.com2o.com_name
        self.vn_id = q.vn_id
        self.transfer_to = transfer_to.id
        self.action_to = action_to.id if action_to else None
        self.transfer_time = transfer_time
        self.station_id = station_id

donequeue_tb = Table('sr_done_queue', meta,
                        Column('id', t.Integer(),
                                sa.Sequence('sr_done_queue_id_seq', optional=True),
                                primary_key=True),
                        Column('vn_id', t.Integer()),
                        Column('com_id1', t.Integer()),
                        Column('com1', t.String(100)),
                        Column('user1', t.Integer()),
                        Column('action_id', t.Integer()),
                        Column('action', t.Text()),
                        Column('com_id2', t.Integer()),
                        Column('com2', t.String(100)),
                        Column('user2', t.Integer()),
                        Column('transfer_to', t.Integer()),
                        Column('action_to', t.Integer()),
                        Column('transfer_time', t.DATETIME()),
                        Column('time_send', t.DATETIME()),
                        Column('time_receive', t.DATETIME()),
                        Column('an', t.String(20)),
                        Column('station_id', t.Integer()),
                        schema=sch)



# --------------------------
# Social Section
# --------------------------
class HelpMethod(object):
    @staticmethod
    def all(session):
        return session.query(HelpMethod).filter_by(deleted=False).\
            order_by(help_method_tb.c.code).all()
help_method_tb = Table('sr_help_method', meta,
                         Column('id', t.Integer(),
                                sa.Sequence('sr_help_method_id_seq', optional=True),
                                primary_key=True),
                         Column('code', t.String(20)),
                         Column('description', t.Text()),
                         Column('created_by', t.Integer()),
                         Column('created_date', t.DATETIME()),
                         Column('updated_by', t.Integer()),
                         Column('updated_date', t.DATETIME()),
                         Column('deleted_by', t.Integer()),
                         Column('deleted_date', t.DATETIME()),
                         Column('deleted', t.Boolean(), default=False),
                         schema=scSch)

class SocialProblem(object):
    @staticmethod
    def all(session):
        return session.query(SocialProblem).filter_by(deleted=False).\
            order_by(social_problem_tb.c.code).all()
social_problem_tb = Table('sr_social_problem', meta,
                         Column('id', t.Integer(),
                                sa.Sequence('sr_social_problem_id_seq', optional=True),
                                primary_key=True),
                         Column('code', t.String(20)),
                         Column('description', t.Text()),
                         Column('created_by', t.Integer()),
                         Column('created_date', t.DATETIME()),
                         Column('updated_by', t.Integer()),
                         Column('updated_date', t.DATETIME()),
                         Column('deleted_by', t.Integer()),
                         Column('deleted_date', t.DATETIME()),
                         Column('deleted', t.Boolean(), default=False),
                         schema=scSch)

class HealthStation(object):
    @staticmethod
    def all(session):
        return session.query(HealthStation).filter_by(deleted=False).\
            order_by(health_station_tb.c.code).all()
health_station_tb = Table('sr_health_station', meta,
                         Column('id', t.Integer(),
                                sa.Sequence('sr_health_station_id_seq', optional=True),
                                primary_key=True),
                         Column('code', t.String(20)),
                         Column('name', t.String(200)),
                         Column('created_by', t.Integer()),
                         Column('created_date', t.DATETIME()),
                         Column('updated_by', t.Integer()),
                         Column('updated_date', t.DATETIME()),
                         Column('deleted_by', t.Integer()),
                         Column('deleted_date', t.DATETIME()),
                         Column('deleted', t.Boolean(), default=False),
                         schema=scSch)

class PatientBackground(object): pass
background_tb = Table('sr_patient_background', meta,
                         Column('id', t.Integer(),
                                sa.Sequence('sr_background_id_seq', optional=True),
                                primary_key=True),
                         Column('patient_id', t.Integer()),
                         Column('info_provider', t.String(100)),
                         Column('provider_relation', t.String(100)),
                         Column('important_symptom', t.Text()),
                         Column('period', t.String(100)),
                         #Column('health_station_id', t.Integer(),
                         #   ForeignKey(scSch+'.'+'sr_health_station.id')),
                         Column('health_station', t.String(200)),
                         Column('history_physical', t.Text()),
                         Column('history_mental', t.Text()),
                         Column('history_accident', t.Text()),
                         Column('history_development', t.Text()),

                         Column('history_med_alergy', t.Text()),
                         Column('personality', t.Text()),
                         Column('heredity', t.Text()),
                         Column('drug_usage', t.Text()),
                         Column('history_family', t.Text()),
                         Column('social_analysis_text', t.Text()),
                         Column('oracle_id', t.Integer()),
                         Column('created_by', t.Integer()),
                         Column('created_date', t.DATETIME()),
                         Column('updated_by', t.Integer()),
                         Column('updated_date', t.DATETIME()),
                         Column('deleted_by', t.Integer()),
                         Column('deleted_date', t.DATETIME()),
                         Column('deleted', t.Boolean(), default=False),
                         schema=scSch)

class BackgroundHelp(object): pass
background_help_tb = Table('sr_background_help', meta,
                         Column('id', t.Integer(),
                                sa.Sequence('sr_background_help_id_seq', optional=True),
                                primary_key=True),
                         Column('background_id', t.Integer(),
                                ForeignKey(scSch+'.'+'sr_patient_background.id')),
                         Column('help_id', t.Integer(),
                                ForeignKey(scSch+'.'+'sr_help_method.id')),
                         Column('more_help_info', t.Text()),
                         Column('created_by', t.Integer()),
                         Column('created_date', t.DATETIME()),
                         Column('updated_by', t.Integer()),
                         Column('updated_date', t.DATETIME()),
                         Column('deleted_by', t.Integer()),
                         Column('deleted_date', t.DATETIME()),
                         Column('deleted', t.Boolean(), default=False),
                         schema=scSch)

class BackgroundProblem(object):
    @staticmethod
    def count_by_type(start_date, end_date):
        stmt = select([func.substr(SocialProblem.code, 1, 2).distinct().label('code'),
                       func.count(func.substr(SocialProblem.code, 1, 2)).label('count')],
                       (BackgroundProblem.deleted == False) & (between(BackgroundProblem.created_date, start_date, end_date)),
                       from_obj=[join(BackgroundProblem, SocialProblem,
                                      BackgroundProblem.problem_id==SocialProblem.id)])\
                        .group_by(func.substr(SocialProblem.code, 1, 2))
        rs = stmt.execute()
        result = rs.fetchall()
        rs.close()
        return result

background_problem_tb = Table('sr_background_problem', meta,
                         Column('id', t.Integer(),
                                sa.Sequence('sr_background_problem_id_seq', optional=True),
                                primary_key=True),
                         Column('background_id', t.Integer(),
                                ForeignKey(scSch+'.'+'sr_patient_background.id')),
                         Column('problem_id', t.Integer(),
                                ForeignKey(scSch+'.'+'sr_social_problem.id')),
                         Column('more_problem_info', t.Text()),
                         Column('created_by', t.Integer()),
                         Column('created_date', t.DATETIME()),
                         Column('updated_by', t.Integer()),
                         Column('updated_date', t.DATETIME()),
                         Column('deleted_by', t.Integer()),
                         Column('deleted_date', t.DATETIME()),
                         Column('deleted', t.Boolean(), default=False),
                         schema=scSch)

class PatientNiti(object): pass
niti_tb = Table('sr_patient_niti', meta,
                        Column('id', t.Integer(),
                            sa.Sequence('sr_niti_id_seq', optional=True),
                            primary_key=True),
                        Column('patient_id', t.Integer()),
                        Column('crime', t.String(200)),
                        Column('commit_date', t.DateTime()),
                        Column('surrender_date', t.DateTime()),
                        Column('hospital_date', t.DateTime()),
                        Column('admit_date', t.DateTime()),
                        Column('hospital_reason', t.Text()),
                        Column('info_provider', t.Text()),
                        Column('personality', t.Text()),
                        Column('personality_from_family', t.Text()),
                        Column('history_physical', t.Text()),
                        Column('history_mental', t.Text()),
                        Column('history_crime', t.Text()),
                        Column('drug_usage', t.Text()),
                        Column('history_accident', t.Text()),
                        Column('sex_experience', t.Text()),
                        Column('heredity', t.Text()),
                        Column('history_family', t.Text()),
                        Column('social_analysis_text', t.Text()),
                        Column('created_by', t.Integer()),
                        Column('created_date', t.DATETIME()),
                        Column('updated_by', t.Integer()),
                        Column('updated_date', t.DATETIME()),
                        Column('deleted_by', t.Integer()),
                        Column('deleted_date', t.DATETIME()),
                        Column('deleted', t.Boolean(), default=False),
                        schema=scSch)

class NitiHelp(object): pass
niti_help_tb = Table('sr_niti_help', meta,
                        Column('id', t.Integer(),
                                sa.Sequence('sr_niti_help_id_seq', optional=True),
                                primary_key=True),
                         Column('niti_id', t.Integer(),
                                ForeignKey(scSch+'.'+'sr_patient_niti.id')),
                         Column('help_id', t.Integer(),
                                ForeignKey(scSch+'.'+'sr_help_method.id')),
                         Column('more_help_info', t.Text()),
                         Column('created_by', t.Integer()),
                         Column('created_date', t.DATETIME()),
                         Column('updated_by', t.Integer()),
                         Column('updated_date', t.DATETIME()),
                         Column('deleted_by', t.Integer()),
                         Column('deleted_date', t.DATETIME()),
                         Column('deleted', t.Boolean(), default=False),
                         schema=scSch)

class NitiProblem(object): pass
niti_problem_tb = Table('sr_niti_problem', meta,
                         Column('id', t.Integer(),
                                sa.Sequence('sr_niti_problem_id_seq', optional=True),
                                primary_key=True),
                         Column('niti_id', t.Integer(),
                                ForeignKey(scSch+'.'+'sr_patient_niti.id')),
                         Column('problem_id', t.Integer(),
                                ForeignKey(scSch+'.'+'sr_social_problem.id')),
                         Column('more_problem_info', t.Text()),
                         Column('created_by', t.Integer()),
                         Column('created_date', t.DATETIME()),
                         Column('updated_by', t.Integer()),
                         Column('updated_date', t.DATETIME()),
                         Column('deleted_by', t.Integer()),
                         Column('deleted_date', t.DATETIME()),
                         Column('deleted', t.Boolean(), default=False),
                         schema=scSch)
'''
class Province(object): pass
province_tb = Table('sr_province', meta,
                        Column('id', t.Integer(), primary_key=True),
                        Column('name', t.String(100)),
                        Column('created_by', t.Integer()),
                         Column('created_date', t.DATETIME()),
                         Column('updated_by', t.Integer()),
                         Column('updated_date', t.DATETIME()),
                         Column('deleted_by', t.Integer()),
                         Column('deleted_date', t.DATETIME()),
                         Column('deleted', t.Boolean(), default=False),
                        schema=sch)

class Education(object): pass
education_tb = Table('sr_education', meta,
                        Column('id', t.Integer(),
                                sa.Sequence('sr_education_id_seq', optional=True),
                                primary_key=True),
                        Column('name', t.String(100)),
                        Column('created_by', t.Integer()),
                         Column('created_date', t.DATETIME()),
                         Column('updated_by', t.Integer()),
                         Column('updated_date', t.DATETIME()),
                         Column('deleted_by', t.Integer()),
                         Column('deleted_date', t.DATETIME()),
                         Column('deleted', t.Boolean(), default=False),
                        schema=sch)

class Job(object): pass
job_tb = Table('sr_job', meta,
                        Column('id', t.Integer(),
                                sa.Sequence('sr_job_id_seq', optional=True),
                                primary_key=True),
                        Column('name', t.String(200)),
                        Column('created_by', t.Integer()),
                         Column('created_date', t.DATETIME()),
                         Column('updated_by', t.Integer()),
                         Column('updated_date', t.DATETIME()),
                         Column('deleted_by', t.Integer()),
                         Column('deleted_date', t.DATETIME()),
                         Column('deleted', t.Boolean(), default=False),
                        schema=sch)

class MarriageStatus(object): pass
marriage_status_tb = Table('sr_marriage_status', meta,
                        Column('id', t.Integer(),
                                sa.Sequence('sr_marriage_status_id_seq', optional=True),
                                primary_key=True),
                        Column('name', t.String(200)),
                        Column('created_by', t.Integer()),
                         Column('created_date', t.DATETIME()),
                         Column('updated_by', t.Integer()),
                         Column('updated_date', t.DATETIME()),
                         Column('deleted_by', t.Integer()),
                         Column('deleted_date', t.DATETIME()),
                         Column('deleted', t.Boolean(), default=False),
                        schema=sch)
'''
class RequestReason(object): pass
request_reason_tb = Table('sr_request_reason', meta,
                        Column('id', t.Integer(),
                                sa.Sequence('sr_request_reason_id_seq', optional=True),
                                primary_key=True),
                        Column('code', t.String(20)),
                        Column('name', t.String(200)),
                        Column('created_by', t.Integer()),
                         Column('created_date', t.DATETIME()),
                         Column('updated_by', t.Integer()),
                         Column('updated_date', t.DATETIME()),
                         Column('deleted_by', t.Integer()),
                         Column('deleted_date', t.DATETIME()),
                         Column('deleted', t.Boolean(), default=False),
                        schema=scSch)

class HelpReason(object): pass
help_reason_tb = Table('sr_help_reason', meta,
                        Column('id', t.Integer(),
                                sa.Sequence('sr_help_reason_id_seq', optional=True),
                                primary_key=True),
                        Column('code', t.String(20)),
                        Column('name', t.String(200)),
                        Column('created_by', t.Integer()),
                         Column('created_date', t.DATETIME()),
                         Column('updated_by', t.Integer()),
                         Column('updated_date', t.DATETIME()),
                         Column('deleted_by', t.Integer()),
                         Column('deleted_date', t.DATETIME()),
                         Column('deleted', t.Boolean(), default=False),
                        schema=scSch)

class SocialPatientInfo(object):pass
social_patient_info_tb = Table('sr_social_patient_info', meta,
                        Column('id', t.Integer(),
                            sa.Sequence('sr_social_patient_info_id_seq', optional=True),
                            primary_key=True),
                        Column('patient_id', t.Integer()),
                        Column('province_id', t.Integer()),
                        Column('education_id', t.Integer()),
                        Column('occupation_id', t.Integer()),
                        #Column('domicile', t.String(200)), #ForeignKey(sch+'.sr_province.id')),
                        #Column('education', t.String(200)), #ForeignKey(sch+'.sr_education.id')),
                        #Column('job', t.String(200)), #ForeignKey(sch+'.sr_job.id')),
                        Column('marriage_status_id', t.Integer()),
                        Column('income', t.DECIMAL(18,2), default=0),
                        Column('history_family', t.Text()),
                        Column('family_relationship', t.Text()),
                        Column('deleted', t.Boolean(), default=False),
                        Column('created_by', t.Integer()),
                        Column('created_date', t.DATETIME()),
                        Column('updated_by', t.Integer()),
                        Column('updated_date', t.DATETIME()),
                        Column('deleted_by', t.Integer()),
                        Column('deleted_date', t.DATETIME()),
                        schema=scSch)


class SocialSupport(object):
    def getSupportItem(self, group_id):
        s = orm.object_session(self)
        return s.query(SocialSupportItem).filter_by(support_id=self.id, group_id=group_id).first()

    @staticmethod
    def patient_support(session, vn_id):
        support = session.query(SocialSupport).filter_by(vn_id=vn_id, deleted=False,\
            receipt_id=None).first()
        return support

    @staticmethod
    def get_unsent_support(sess, receipts, group_id):
        stmt = select([func.sum(SocialSupportItem.support_amount).label('support_amount')], \
               #(NeuralOrder.id==order_id) & (NeuralRecord.paid==False) & \
               (ReceiptH.sent==False) & (ReceiptH.code != None) & (ReceiptH.id.in_(receipts)) & \
               (SocialSupportItem!=0) & (SocialSupportItem.group_id==group_id), \
               #(NeuralRecord.deleted==False), \
               from_obj=[join(SocialSupportItem, SocialSupport, SocialSupportItem.support_id==SocialSupport.id)\
                         .join(ReceiptH, SocialSupport.receipt_id==ReceiptH.id)])
        rs = stmt.execute()
        result = rs.fetchone()
        rs.close()
        return result[0]

    @staticmethod
    def sum_support(start_date, end_date, patient_type):
        filters = (SocialSupport.deleted == False) & (SocialSupport.receipt_id != None) & \
                       (between(SocialSupport.created_date, start_date, end_date))
        if patient_type == "opd":
            filters = filters & (Visit.an == None)
        else:
            filters = filters & (Visit.an != None)
        stmt = select([func.sum(SocialSupport.totalprice).label('total'),
                       func.sum(SocialSupport.canpay_amount).label('canpay'),
                       func.sum(SocialSupport.support_amount).label('support')],
                       filters,
                       from_obj=[join(SocialSupport, Visit, SocialSupport.vn_id==Visit.id)])
        rs = stmt.execute()
        result = rs.fetchall()
        rs.close()
        return result

    @staticmethod
    def count_by_sex(start_date, end_date, patient_type):
        filters = (SocialSupport.deleted == False) & (SocialSupport.receipt_id != None) & \
                       (between(SocialSupport.created_date, start_date, end_date))
        if patient_type == "opd":
            filters = filters & (Visit.an == None)
        else:
            filters = filters & (Visit.an != None)
        stmt = select([Patient.pa_sex, func.count(SocialSupport.patient_id.distinct()).label('count')],
                       filters,
                       from_obj=[join(SocialSupport, Visit, SocialSupport.vn_id==Visit.id)\
                         .join(Patient, Visit.id_patient==Patient.id)]).group_by(Patient.pa_sex)

        rs = stmt.execute()
        result = rs.fetchall()
        rs.close()
        return result

social_support_tb = Table('sr_social_support', meta,
                        Column('id', t.Integer(),
                            sa.Sequence('sr_social_support_id_seq', optional=True),
                            primary_key=True),
                        Column('patient_id', t.Integer()),
                        Column('vn_id', t.Integer(),
                            ForeignKey(mrSch+'.nano_visit.id')),
                        Column('receipt_id', t.Integer(),
                            ForeignKey(fnSch+'.sr_receipt_h.id')),
                        Column('request_no', t.Integer()),
                        Column('request_date', t.DateTime()),
                        Column('status', t.Integer()),
                        Column('totalprice', t.DECIMAL(18,2), default=0),
                        Column('canpay_amount', t.DECIMAL(18,2), default=0),
                        Column('req_amount', t.DECIMAL(18,2), default=0),
                        Column('support_amount', t.DECIMAL(18,2), default=0),
                        Column('deposit', t.DECIMAL(18,2), default=0),
                        #Column('domicile', t.String(100)), #ForeignKey(sch+'.sr_province.id')),
                        #Column('education', t.String(100)), #ForeignKey(sch+'.sr_education.id')),
                        #Column('job', t.String(100)), #ForeignKey(sch+'.sr_job.id')),
                        #Column('marriage_status', t.String(100)),
                        Column('request_reason', t.String(100)),
                        #Column('request_reason_id', t.Integer(), ForeignKey(scSch+'.sr_request_reason.id')),
                        Column('support_reason', t.String(100)),
                        #Column('help_reason_id', t.Integer(), ForeignKey(scSch+'.sr_help_reason.id')),
                        #Column('income', t.DECIMAL(18,2)),
                        Column('request_person', t.String(200)),
                        Column('request_relation', t.String(200)),
                        #Column('history_family', t.Text()),
                        #Column('family_relationship', t.Text()),
                        Column('deleted', t.Boolean(), default=False),
                        Column('created_by', t.Integer()),
                        Column('created_date', t.DATETIME()),
                        Column('updated_by', t.Integer()),
                        Column('updated_date', t.DATETIME()),
                        Column('deleted_by', t.Integer()),
                        Column('deleted_date', t.DATETIME()),
                        schema=scSch)

class SocialSupportItem(object): pass
social_support_item_tb = Table('sr_social_support_item', meta,
                        Column('id', t.Integer(),
                            sa.Sequence('sr_social_support_item_id_seq', optional=True),
                            primary_key=True),
                        Column('support_id', t.Integer(), ForeignKey(scSch+'.sr_social_support.id')),
                        Column('group_id', t.Integer(), ForeignKey(fnSch+'.'+'sr_item_group.id')),
                        Column('total_price', t.DECIMAL(18,2)),
                        Column('subsidy_amount', t.DECIMAL(18,2)),
                        Column('support_amount', t.DECIMAL(18,2)),
                        schema=scSch)
#                        Column('unit_id', t.Integer(), ForeignKey(fnSch+'.'+'sr_item_unit.id')),
#                        Column('qty', t.DECIMAL(18,2)),
#                        Column('price', t.DECIMAL(18,2)),
#                        Column('deleted', t.Boolean(), default=False),
#                        Column('created_date', t.DateTime(), PassiveDefault(text("now()"))),
#                        Column('created_by', t.Integer()),
#                        Column('updated_by', t.Integer()),
#                        Column('updated_date', t.DATETIME()),
#                        Column('deleted_by', t.Integer()),
#                        Column('deleted_date', t.DATETIME()),
#                        schema=scSch)
# --------------------------
# Finance Section
# --------------------------

class Item(object):
    @staticmethod
    def get_ps(sess):
        return sess.query(Item).get(Item.PS_ID)

    @staticmethod
    def get_eeg(sess):
        return sess.query(Item).get(Item.EEG_ID)

    @staticmethod
    def get_ekg(sess):
        return sess.query(Item).get(Item.EKG_ID)

    @staticmethod
    def get_xray(sess):
        return sess.query(Item).get(Item.XRAY_ID)

    @staticmethod
    def get_ipd_er_charge(sess):
        return sess.query(Item).get(Item.IPD_ER_CHARGE_ID)

    @staticmethod
    def get_ipd_service_charge(sess):
        return sess.query(Item).get(Item.IPD_SERVICE_CHARGE_ID)

    @staticmethod
    def get_normal_room(sess):
        return sess.query(Item).get(Item.NORMAL_ROOM_ID)

    @staticmethod
    def get_special_food(sess):
        return sess.query(Item).get(Item.SPECIAL_FOOD_ID)

    @staticmethod
    def get_cheap_special_room(sess):
        return sess.query(Item).get(Item.CHEAP_SPECIAL_ROOM_ID)

    @staticmethod
    def get_cheap_special_room_three(sess):
        return sess.query(Item).get(Item.CHEAP_SPECIAL_ROOM_THREE_ID)

    @staticmethod
    def get_cheap_special_room_six(sess):
        return sess.query(Item).get(Item.CHEAP_SPECIAL_ROOM_SIX_ID)
      
	@staticmethod
	def get_covid_room(sess):
		return sess.query(Item).get(Item.COVID_ROOM_ID)

    @staticmethod
    def get_special_room(sess):
        return sess.query(Item).get(Item.SPECIAL_ROOM_ID)

    @staticmethod
    def get_service_charge(sess):
        return sess.query(Item).get(Item.SERVICE_CHARGE_ID)

    @staticmethod
    def get_ot_service_charge(sess):
        return sess.query(Item).get(Item.OT_CHARGE_ID)

    @staticmethod
    def get_deposit(sess):
        return sess.query(Item).get(Item.DEPOSIT_ID)

    @staticmethod
    def get_foreigner_service_charge(sess):
        return sess.query(Item).get(Item.FOREIGNER_SERVICE_CHARGE_ID)

item_tb = Table('sr_item', meta,
                        Column('id', t.Integer(),
                            sa.Sequence('sr_item_id_seq', optional=True),
                            primary_key=True),
                        Column('item_code', t.String(20)),
                        Column('name', t.String(100)),
                        Column('group_id', t.Integer(), ForeignKey(fnSch+'.'+'sr_item_group.id')),
                        Column('unit_id', t.Integer(), ForeignKey(fnSch+'.'+'sr_item_unit.id')),
                        Column('price', t.DECIMAL(18,2)),
                        Column('show', t.Boolean(), default=False),
                        Column('special', t.Boolean(), default=False),
                        Column('pay', t.Boolean(), default=True),
                        Column('ipd', t.Boolean(), default=False),
                        Column('use_price_factor', t.Boolean(), default=True),
                        Column('deleted', t.Boolean(), default=False),
                        Column('created_by', t.Integer()),
                        Column('created_date', t.DATETIME()),
                        Column('updated_by', t.Integer()),
                        Column('updated_date', t.DATETIME()),
                        Column('deleted_by', t.Integer()),
                        Column('deleted_date', t.DATETIME()),
                        schema=fnSch)

class ItemGroup(object): pass
item_group_tb = Table('sr_item_group', meta,
                        Column('id', t.Integer(),
                            sa.Sequence('sr_item_group_id_seq', optional=True),
                            primary_key=True),
                        Column('name', t.String(100)),
                        Column('show', t.Boolean(), default=False),
                        Column('deleted', t.Boolean(), default=False),
                        Column('created_by', t.Integer()),
                        Column('created_date', t.DATETIME()),
                        Column('updated_by', t.Integer()),
                        Column('updated_date', t.DATETIME()),
                        Column('deleted_by', t.Integer()),
                        Column('deleted_date', t.DATETIME()),
                        schema=fnSch)

class ItemUnit(object): pass
item_unit_tb = Table('sr_item_unit', meta,
                        Column('id', t.Integer(),
                            sa.Sequence('sr_item_unit_id_seq', optional=True),
                            primary_key=True),
                        Column('name', t.String(100)),
                        Column('deleted', t.Boolean(), default=False),
                        Column('created_by', t.Integer()),
                        Column('created_date', t.DATETIME()),
                        Column('updated_by', t.Integer()),
                        Column('updated_date', t.DATETIME()),
                        Column('deleted_by', t.Integer()),
                        Column('deleted_date', t.DATETIME()),
                        schema=fnSch)

#class ItemOrder(object): pass
#item_order_tb = Table('sr_item_order', meta,
#                        Column('id', t.Integer(),
#                            sa.Sequence('sr_item_order_id_seq', optional=True),
#                            primary_key=True),
#                        Column('vn_id', t.Integer(), ForeignKey(mrSch+'.'+'nano_visit.id')),
#                        Column('item_id', t.Integer(), ForeignKey(fnSch+'.'+'sr_item.id')),
#                        Column('unit_id', t.Integer(), ForeignKey(fnSch+'.'+'sr_item_unit.id')),
#                        Column('qty', t.DECIMAL(18,2)),
#                        Column('price', t.DECIMAL(18,2)),
#                        Column('paid', t.Boolean(), default=False),
#                        Column('support', t.Boolean(), default=False),
#                        Column('privilege_id', t.Integer(), ForeignKey(fnSch+'.sr_privilege.id')),
#                        Column('deleted', t.Boolean(), default=False),
#                        Column('created_date', t.DateTime(), PassiveDefault(text("now()"))),
#                        Column('created_by', t.Integer()),
#                        Column('updated_by', t.Integer()),
#                        Column('updated_date', t.DATETIME()),
#                        Column('deleted_by', t.Integer()),
#                        Column('deleted_date', t.DATETIME()),
#                        schema=fnSch)

class Privilege(object):
    @staticmethod
    def all(session):
        return session.query(Privilege).filter_by(deleted=False).\
            order_by(privilege_tb.c.name).all()

    def subsidy_amount(self, session, item_id, qty, price, frequency, dose):
        item = session.query(Item).get(item_id)
        if item.special:
            if self.special:
                special = session.query(SpecialItemSubsidy).filter_by(\
                            privilege_id=self.id, deleted=False, \
                            item_id=item_id).first()
                if (special):
                    qtyPerDay = frequency * dose
                    maxQty = ceil(qtyPerDay * special.max_day_allowed)
                    #maxQty = float(qtyPerDay * special.max_day_allowed)
                    if item.group_id == ItemGroup.MedInId or item.group_id == ItemGroup.MedOutId:
                        drug = session.query(Drug).filter_by(item_id=item_id).first()
                        qty = float(qty) * drug.dose_capacity
                        price = float(price) / drug.dose_capacity
                        if float(qty) >= float(maxQty):
                            return ceil(float(price) * float(maxQty))
                            #return float(float(price) * float(maxQty))
                        else:
                            return ceil(float(price) * float(qty))
                            #return float(float(price) * float(qty))
                    return ceil(float(qty) * float(special.subsidy_amount))
                    #return float(float(qty) * float(special.subsidy_amount))
                else:
                    return 0
        elif item.group_id == ItemGroup.MedInId:
            if self.med_in:
                if (frequency == 0):
                    #return ceil(float(price) * float(qty))
                    return ceil(float(price) * float(qty))
                else:
                    usePerDay = frequency
                    qtyPerDay = usePerDay * dose
                    #maxQty = ceil(qtyPerDay * self.max_med_period)
                    maxQty = ceil(qtyPerDay * self.max_med_period)
                    drug = session.query(Drug).filter_by(item_id=item_id).first()
                    qty = float(qty) * drug.dose_capacity
                    price = float(price) / drug.dose_capacity
                    if  float(qty) >= float(maxQty):
                        #return ceil(float(price) * float(maxQty))
                        return ceil(float(price) * float(maxQty))
                    else:
                        #return ceil(float(price) * float(qty))
                        return ceil(float(price) * float(qty))

            else:
                return 0
        elif item.group_id == ItemGroup.MedOutId:
            if self.med_out:
                if (frequency == 0):
                    #return ceil(float(price) * float(qty))
                    return ceil(float(price) * float(qty))
                else:
                    usePerDay = frequency
                    qtyPerDay = usePerDay * dose
                    maxQty = ceil(qtyPerDay * self.max_med_period)
                    drug = session.query(Drug).filter_by(item_id=item_id).first()
                    qty = float(qty) * drug.dose_capacity
                    price = float(price) / drug.dose_capacity
                    if float(qty) >= float(maxQty):
                        #return ceil(float(price) * float(maxQty))
                        return ceil(float(price) * float(maxQty))
                    else:
                        #return ceil(float(price) * float(qty))
                        return ceil(float(price) * float(qty))
            else:
                return 0

        else:
            if self.privileged:
                #return ceil(float(price) * float(qty))
                return ceil(float(price) * float(qty))
            else:
                return 0
        return 0

privilege_tb = Table('sr_privilege', meta,
                        Column('id', t.Integer(),
                            sa.Sequence('sr_privilege_id_seq', optional=True),
                            primary_key=True),
                        Column('name', t.String(100)),
                        Column('privileged', t.Boolean(), default=False),
                        Column('max_med_period', t.Integer()),
                        Column('max_med_amount', t.DECIMAL(18,2)),
                        Column('med_in', t.Boolean()),
                        Column('med_out', t.Boolean()),
                        Column('special', t.Boolean()),
                        Column('created_by', t.Integer()),
                        Column('created_date', t.DATETIME()),
                        Column('updated_by', t.Integer()),
                        Column('updated_date', t.DATETIME()),
                        Column('deleted_by', t.Integer()),
                        Column('deleted_date', t.DATETIME()),
                        Column('deleted', t.Boolean(), default=False),
                        schema=fnSch)

class SpecialItemSubsidy(object): pass
special_item_subsidy_tb = Table('sr_special_item_subsidy', meta,
                            Column('id', t.Integer(),
                                   sa.Sequence('sr_special_item_subsidy_id_seq', optional=True),
                                   primary_key=True),
                            Column('privilege_id', t.Integer(),
                                   ForeignKey(fnSch + '.sr_privilege.id')),
                            Column('item_id', t.Integer(),
                                   ForeignKey(fnSch+'.sr_item.id')),
                            Column('subsidy_amount', t.DECIMAL(18, 2)),
                            Column('max_day_allowed', t.Integer()),
                            Column('created_by', t.Integer()),
                            Column('created_date', t.DATETIME()),
                            Column('updated_by', t.Integer()),
                            Column('updated_date', t.DATETIME()),
                            Column('deleted_by', t.Integer()),
                            Column('deleted_date', t.DATETIME()),
                            Column('deleted', t.Boolean(), default=False),
                            schema=fnSch
                         )

class ReceiptH(object):
    @staticmethod
    def getSummaryByPrivilege(start_date, end_date, patient_type):
        type_filter = Visit.an==None
        if patient_type == 'ipd':
            type_filter = Visit.an!=None
        stmt = select([Privilege.name, \
                    func.sum(ReceiptH.receive_amount).label('receive'), \
                    func.sum(ReceiptH.subsidy_amount).label('subsidy'), \
                    func.sum(ReceiptH.support_amount).label('support'), \
                    func.sum(ReceiptH.discount).label('discount'), \
                    func.sum(ReceiptH.deposit).label('deposit'), \
                    func.count(ReceiptH.vn_id.distinct()).label('visit_count')], \
               (ReceiptH.cancelled==False) & (type_filter) &
               (between(Visit.time_add, start_date, end_date)), \
               #(between(ReceiptH.receipt_date, start_date, end_date)), \
               from_obj=[join(ReceiptH, Privilege, ReceiptH.privilege_id==Privilege.id)\
                         .join(Visit, ReceiptH.vn_id==Visit.id)])\
                .group_by(Privilege.name)\
                .order_by(Privilege.name)
        rs = stmt.execute()
        result = rs.fetchall()
        rs.close()
        return result

    @staticmethod
    def getReceipts(start_date, end_date, cancelled, station_id):
        s = Session()
        query = s.query(ReceiptH).filter_by(station_id=station_id).\
            filter(between(\
            ReceiptH.receipt_date, start_date, end_date)).\
            filter(ReceiptH.code!=None)
        if cancelled != None:
            query = query.filter_by(cancelled=cancelled)
        return query.all()

    @staticmethod
    def getPatientCount(sess, receipts):
        stmt = select([func.count(ReceiptH.pa_id.distinct()).label('patient_count')], \
               (ReceiptH.id.in_(receipts)))
        rs = stmt.execute()
        result = rs.fetchone()
        rs.close()
        return result[0]

    @staticmethod
    def genReceipt(sess, orders, receive_amount, support_amount, subsidy_amount,
                   deposit, discount, support, visit, user_id, station_id):
        receipth = ReceiptH()
        now = datetime.now().strftime('%y%j')
        prefix = "RC-" + now + "-" + str(station_id) + "-"
        if receive_amount > 0:
            receipth.code = Rundoc.rundoc(sess, prefix)
        receipth.receipt_date = datetime.now()
        receipth.vn_id = visit.id
        receipth.pa_id = visit.patient.id
        receipth.privilege_id = visit.privilege_id
        receipth.receive_amount = receive_amount
        receipth.support_amount = support_amount
        receipth.subsidy_amount = subsidy_amount
        receipth.deposit = deposit
        receipth.station_id = station_id
        visit.patient.deposit -= deposit
        sess.save_or_update(visit.patient)
        receipth.discount = discount
        receipth.created_by = user_id
        receipth.created_date = datetime.now()
        sess.save_or_update(receipth)
        if support:
            support.receipt = receipth
            sess.save_or_update(support)

        arrItemIds = []
        items = []
        orderids = []
        for order_id in orders:
            orderids.append(int(order_id))
        records = NeuralRecord.unpaid_records_by_orders(orderids, receipth.pa_id)
        arrRecords = []
        privilege = visit.privilege

        for o in records:
            subsidy_amount = privilege.subsidy_amount(sess, o.item_id,\
                                o.qty, o.price, o.frequency, \
                                o.pertime) if privilege else 0.0

            receiptd = ReceiptD()
            receiptd.receipth = receipth
            receiptd.item_id = o.item_id
            receiptd.qty = ceil(o.qty)
            receiptd.price = float(o.price)
            receiptd.total_amount = ceil(receiptd.qty * receiptd.price)
            receiptd.subsidy_amount = subsidy_amount
            receiptd.created_by = user_id
            receiptd.created_date = datetime.now()
            sess.save_or_update(receiptd)
            if o.item_id == Item.DEPOSIT_ID:
                visit.patient.deposit += ceil(float(o.qty) * float(o.price))

        for order_id in orderids:
            ord = sess.query(NeuralOrder).get(order_id)
            ord.paid = True
            sess.save_or_update(ord)
            receiptOrder = ReceiptOrder()
            receiptOrder.receipth = receipth
            receiptOrder.order_id = ord.id
            sess.save_or_update(ord)
#        for order in orders:
#            ord = sess.query(NeuralOrder).get(int(order['id']))
#            for order_item in ord.order_items:
#                for record in order_item.records:
#                    receiptd = ReceiptD()
#                    receiptd.receipth = receipth
#                    receiptd.record = record
#                    receiptd.created_by = user_id
#                    receiptd.created_date = datetime.now()
#                    sess.save_or_update(receiptd)
#                    if record.order_item.item_id == Item.DEPOSIT_ID:
#                        visit.patient.deposit += (float(record.qty) * float(record.price))
#                sess.save_or_update(visit.patient)
#            ord.paid = True
#            sess.save_or_update(ord)
        sess.commit()
        sess.refresh(receipth)
        return receipth.id

    @staticmethod
    def unsent_items(sess, station_id):
        stmt = select([
                    ItemGroup.id.label('group_id'), ItemGroup.name.label('group_name'), \
                    func.ceiling(func.sum(ReceiptD.total_amount)).label('amount'), \
                    func.ceiling(func.sum(ReceiptD.subsidy_amount)).label('subsidy')], \
               #(NeuralOrder.id==order_id) & (NeuralRecord.paid==False) & \
               (ReceiptH.code!=None) & (ReceiptH.station_id==station_id) & \
               (ReceiptH.sent==False) & (ReceiptH.cancelled==False), \
               #(NeuralRecord.deleted==False), \
               from_obj=[join(ReceiptD, ReceiptH, ReceiptD.receipt_h_id==ReceiptH.id)\
                         .join(Item, ReceiptD.item_id==Item.id)\
                         .join(ItemGroup, Item.group_id==ItemGroup.id)])\
                .group_by(ItemGroup.name, \
                          ItemGroup.id)
        rs = stmt.execute()
        result = rs.fetchall()
        rs.close()
        return result

    def receipt_items(self):
        stmt = select([NeuralOrderItem.item_id, Item.name.label('item_name'), \
                    ItemGroup.id.label('group_id'), ItemGroup.name.label('group_name'), \
                    ItemUnit.name.label('unit_name'), Item.item_code.label('item_code'),\
                    ItemGroup.show.label('show_group'), \
                    func.ceiling(func.sum(NeuralRecord.qty)).label('qty'), \
                    NeuralRecord.price, NeuralOrderItem.frequency, NeuralOrderItem.pertime], \
               #(NeuralOrder.id==order_id) & (NeuralRecord.paid==False) & \
               (ReceiptD.receipt_h_id==self.id), \
               #(NeuralRecord.deleted==False), \
               from_obj=[join(ReceiptD, NeuralRecord, ReceiptD.record_id==NeuralRecord.id)\
                         .join(NeuralOrderItem, NeuralRecord.order_item_id==NeuralOrderItem.id)\
                         .join(NeuralOrder, NeuralOrderItem.order_id==NeuralOrder.id)\
                         .join(Item, NeuralOrderItem.item_id==Item.id)\
                         .join(ItemGroup, Item.group_id==ItemGroup.id)\
                         .join(ItemUnit, Item.unit_id==ItemUnit.id)])\
                .group_by(NeuralOrderItem.item_id, Item.name, ItemGroup.name, \
                          ItemUnit.name, NeuralRecord.price,NeuralOrderItem.frequency, \
                          NeuralOrderItem.pertime, ItemGroup.id, Item.item_code, ItemGroup.show)
        rs = stmt.execute()
        result = rs.fetchall()
        rs.close()
        return result

    def group_receipt_items(self):
        stmt = select([
                    ItemGroup.id.label('group_id'), ItemGroup.name.label('group_name'), \
                    func.ceiling(func.sum(ReceiptD.total_amount)).label('amount'), \
                    func.ceiling(func.sum(ReceiptD.subsidy_amount)).label('subsidy')], \
               #(NeuralOrder.id==order_id) & (NeuralRecord.paid==False) & \
               (ReceiptH.id==self.id), \
               #(NeuralRecord.deleted==False), \
               from_obj=[join(ReceiptD, ReceiptH, ReceiptD.receipt_h_id==ReceiptH.id)\
                         .join(Item, ReceiptD.item_id==Item.id)\
                         .join(ItemGroup, Item.group_id==ItemGroup.id)])\
                .group_by(ItemGroup.name, \
                          ItemGroup.id)
        rs = stmt.execute()
        result = rs.fetchall()
        rs.close()
        return result

receipt_h_tb = Table('sr_receipt_h', meta,
                        Column('id', t.Integer(),
                            sa.Sequence('sr_receipt_h_id_seq', optional=True),
                            primary_key=True),
                        Column('code', t.String(20)),
                        Column('vn_id', t.Integer(), ForeignKey(mrSch+'.'+'nano_visit.id')),
                        Column('pa_id', t.Integer()),
                        Column('privilege_id', t.Integer(), ForeignKey(fnSch+'.sr_privilege.id')),
                        Column('deposit', t.DECIMAL(18, 2)),
                        Column('discount', t.DECIMAL(18, 2)),
                        Column('support_amount', t.DECIMAL(18, 2)),
                        Column('subsidy_amount', t.DECIMAL(18, 2)),
                        Column('receive_amount', t.DECIMAL(18, 2)),
                        Column('receipt_date', t.DATETIME()),
                        Column('station_id', t.Integer(), ForeignKey(fnSch+'.sr_station.id')),
                        Column('created_by', t.Integer()),
                        Column('created_date', t.DATETIME()),
                        Column('updated_by', t.Integer()),
                        Column('updated_date', t.DATETIME()),
                        Column('cancelled_by', t.Integer()),
                        Column('cancelled_date', t.DATETIME()),
                        Column('cancelled', t.Boolean(), default=False),
                        Column('cancel_reason', t.String(200)),
                        Column('printno', t.Integer(), default=0),
                        Column('sent', t.Boolean(), default=False),
                        Column('send_money_id', t.Integer(), ForeignKey(fnSch+'.sr_send_money.id')),
                        schema=fnSch)

class ReceiptOrder(object):pass
receipt_order_tb = Table('sr_receipt_order', meta,
                        Column('id', t.Integer(),
                            sa.Sequence('sr_receipt_order_id_seq', optional=True),
                            primary_key=True),
                        Column('receipt_h_id', t.Integer(), ForeignKey(fnSch +'.sr_receipt_h.id')),
                        Column('order_id', t.Integer(), ForeignKey(mSch+'.neural_order.id')),
                        schema=fnSch)

class ReceiptD(object): pass
receipt_d_tb = Table('sr_receipt_d', meta,
                        Column('id', t.Integer(),
                            sa.Sequence('sr_receipt_d_id_seq', optional=True),
                            primary_key=True),
                        Column('receipt_h_id', t.Integer(), ForeignKey(fnSch +'.sr_receipt_h.id')),
						#Column('record_id', t.Integer(), ForeignKey(mSch+'.neural_record.id')),
                        Column('item_id', t.Integer(), ForeignKey(fnSch+'.sr_item.id')),
                        Column('qty', t.DECIMAL(18, 2)),
                        Column('price', t.DECIMAL(18, 2)),
                        Column('total_amount', t.DECIMAL(18, 2)),
                        Column('subsidy_amount', t.DECIMAL(18, 2)),
                        #Column('order_id', t.Integer(), ForeignKey(fnSch + '.sr_item_order.id')),
                        #Column('item_id', t.Integer(), ForeignKey(fnSch+'.'+'sr_item.id')),
                        #Column('unit_id', t.Integer(), ForeignKey(fnSch+'.'+'sr_item_unit.id')),
                        #Column('qty', t.DECIMAL(18,2)),
                        #Column('price', t.DECIMAL(18,2)),
                        Column('created_by', t.Integer()),
                        Column('created_date', t.DATETIME()),
                        Column('updated_by', t.Integer()),
                        Column('updated_date', t.DATETIME()),
                        Column('deleted_by', t.Integer()),
                        Column('deleted_date', t.DATETIME()),
                        Column('deleted', t.Boolean(), default=False),
                        schema=fnSch)

class SendMoney(object):
    def getSendMoneyItem(self, group_id):
        s = orm.object_session(self)
        return s.query(SendMoneyItem).filter_by(send_money_id=self.id, group_id=group_id).first()

send_money_tb = Table('sr_send_money', meta,
                        Column('id', t.Integer(),
                            sa.Sequence('sr_send_money_id_seq', optional=True),
                            primary_key=True),
                        Column('code', t.String(20)),
                        Column('send_date', t.DATETIME()),
                        Column('start_receipt', t.String(20)),
                        Column('end_receipt', t.String(20)),
                        Column('send_amount', t.DECIMAL(18, 2)),
                        Column('deposit', t.DECIMAL(18, 2)),
                        Column('discount', t.DECIMAL(18, 2)),
                        Column('patient_count', t.Integer()),
                        Column('station_id', t.Integer(), ForeignKey(fnSch+'.sr_station.id')),
                        Column('created_by', t.Integer()),
                        Column('created_date', t.DATETIME()),
                        schema=fnSch)

class SendMoneyItem(object):pass
send_money_item_tb = Table('sr_send_money_item', meta,
                        Column('id', t.Integer(),
                            sa.Sequence('sr_send_money_item_id_seq', optional=True),
                            primary_key=True),
                        Column('send_money_id', t.Integer(), ForeignKey(fnSch+'.sr_send_money.id')),
                        Column('group_id', t.Integer(), ForeignKey(fnSch+'.sr_item_group.id')),
                        Column('amount', t.DECIMAL(18,2)),
                        schema=fnSch)

class Station(object):
    @staticmethod
    def all(session):
        return session.query(Station).filter_by(deleted=False).\
            order_by(station_tb.c.name).all()

    @staticmethod
    def getStation(session, cip):
        return session.query(Station).filter_by(ip=cip).first()
station_tb = Table('sr_station', meta,
                        Column('id', t.Integer(),
                            sa.Sequence('sr_station_id_seq', optional=True),
                            primary_key=True),
                        Column('name', t.String(60)),
                        Column('ip', t.String(30)),
                        Column('type', t.String(50)),
                        Column('created_by', t.Integer()),
                        Column('created_date', t.DATETIME()),
                        Column('updated_by', t.Integer()),
                        Column('updated_date', t.DATETIME()),
                        Column('deleted_by', t.Integer()),
                        Column('deleted_date', t.DATETIME()),
                        Column('deleted', t.Boolean(), default=False),
                        schema=fnSch)

class Q4utoken(object):
    @staticmethod
    def all(session):
        return session.query(Q4utoken).filter_by(deleted=False).\
            order_by(q4u_token_tb.c.id).all()

    @staticmethod
    def getQ4utoken(session):
        return session.query(Q4utoken).filter_by(deleted=False).first()
q4u_token_tb = Table('q4u_token', meta,
                        Column('id', t.Integer(),
                            sa.Sequence('q4u_token_id_seq', optional=True),
                            primary_key=True),
                        Column('token', t.String(512)),
                        Column('q4u_ip', t.String(30)),
                        Column('deleted', t.Boolean(), default=False),
                        schema=puSch)

# --------------------------
# Psyco Section
# --------------------------
class PsycoReqTestReason(object):pass
req_test_reason_tb = Table('sr_req_test_reason', meta,
                        Column('id', t.Integer(),
                            sa.Sequence('sr_req_test_reason_id_seq', optional=True),
                            primary_key=True),
                        Column('order_id', t.Integer(), ForeignKey(mSch + '.neural_order.id')),
                        Column('reason_id', t.Integer(), ForeignKey(pcSch + '.sr_test_reason.id')),
                        Column('remark', t.Text()),
                        Column('updated_by', t.Integer()),
                        Column('updated_date', t.DATETIME()),
                        Column('deleted_by', t.Integer()),
                        Column('deleted_date', t.DATETIME()),
                        Column('deleted', t.Boolean(), default=False),
                        schema=pcSch)

class PsycoTestReason(object):
    @staticmethod
    def all(session):
        return session.query(PsycoTestReason).filter_by(deleted=False).\
            order_by(test_reason_tb.c.name).all()

test_reason_tb = Table('sr_test_reason', meta,
                        Column('id', t.Integer(),
                            sa.Sequence('sr_test_reason_id_seq', optional=True),
                            primary_key=True),
                        Column('name', t.String(200)),
                        Column('updated_by', t.Integer()),
                        Column('updated_date', t.DATETIME()),
                        Column('deleted_by', t.Integer()),
                        Column('deleted_date', t.DATETIME()),
                        Column('deleted', t.Boolean(), default=False),
                        schema=pcSch)

class PsycoTool(object):
    @staticmethod
    def all(session):
        return session.query(PsycoTool).filter_by(deleted=False).\
            order_by(psyco_tool_tb.c.name).all()

psyco_tool_tb = Table('sr_tool', meta,
                        Column('id', t.Integer(),
                            sa.Sequence('sr_psyco_tool_id_seq', optional=True),
                            primary_key=True),
                        Column('name', t.String(200)),
                        Column('oracle_id', t.Integer()),
                        Column('created_by', t.Integer()),
                        Column('created_date', t.DATETIME()),
                        Column('updated_by', t.Integer()),
                        Column('updated_date', t.DATETIME()),
                        Column('deleted_by', t.Integer()),
                        Column('deleted_date', t.DATETIME()),
                        Column('deleted', t.Boolean(), default=False),
                        schema=pcSch)

#class PsycoTestReqH(object): pass
#psyco_test_req_h_tb = Table('sr_test_req_h', meta,
#                        Column('id', t.Integer(),
#                            sa.Sequence('sr_psyco_test_req_h_id_seq', optional=True),
#                            primary_key=True),
#                        Column('vn_id', t.Integer(), ForeignKey(mrSch+'.'+'nano_visit.id')),
#                        Column('patient_id', t.Integer()),
#                        Column('req_type', t.Integer()),
#                        Column('req_no', t.String(20)),
#                        Column('req_date', t.DateTime()),
#                        Column('req_person_id', t.Integer(), ForeignKey(sch+'.'+'nano_user.id')),
#                        Column('req_reason', t.String(200)),
#                        Column('created_by', t.Integer()),
#                        Column('created_date', t.DATETIME()),
#                        Column('updated_by', t.Integer()),
#                        Column('updated_date', t.DATETIME()),
#                        Column('deleted_by', t.Integer()),
#                        Column('deleted_date', t.DATETIME()),
#                        Column('deleted', t.Boolean(), default=False),
#                        schema=pcSch)
#
#class PsycoTestReqD(object): pass
#psyco_test_req_d_tb = Table('sr_test_req_d', meta,
#                        Column('id', t.Integer(),
#                            sa.Sequence('sr_psyco_test_req_d_id_seq', optional=True),
#                            primary_key=True),
#                        Column('req_id', t.Integer(), ForeignKey(pcSch+'.'+'sr_test_req_h.id')),
#                        Column('item_id', t.Integer(), ForeignKey(fnSch+'.'+'sr_item.id')),
#                        Column('unit_id', t.Integer(), ForeignKey(fnSch+'.sr_item_unit.id')),
#                        Column('req_no', t.String(20)),
#                        Column('done', t.Boolean(), default=False),
#                        Column('created_by', t.Integer()),
#                        Column('created_date', t.DATETIME()),
#                        Column('updated_by', t.Integer()),
#                        Column('updated_date', t.DATETIME()),
#                        Column('deleted_by', t.Integer()),
#                        Column('deleted_date', t.DATETIME()),
#                        Column('deleted', t.Boolean(), default=False),
#                        schema=pcSch)

class PsycoTestResult(object): pass
psyco_test_result_tb = Table('sr_test_result', meta,
                        Column('id', t.Integer(),
                            sa.Sequence('sr_psyco_test_result_id_seq', optional=True),
                            primary_key=True),
                        Column('order_id', t.Integer(), ForeignKey(mSch + '.neural_order.id')),
                        Column('req_no', t.String(20)),
                        Column('type', t.String(20)),
                        Column('behaviour', t.Text()),
                        Column('result', t.Text()),
                        Column('conclusion', t.Text()),
                        Column('suggestion', t.Text()),
                        Column('completed', t.Boolean(), default=False),
                        Column('created_by', t.Integer()),
                        Column('created_date', t.DATETIME()),
                        Column('updated_by', t.Integer()),
                        Column('updated_date', t.DATETIME()),
                        Column('deleted_by', t.Integer()),
                        Column('deleted_date', t.DATETIME()),
                        Column('deleted', t.Boolean(), default=False),
                        schema=pcSch)

class PsycoTestToolUsed(object): pass
psyco_test_tool_used_tb = Table('sr_test_tool_used', meta,
                        Column('id', t.Integer(),
                            sa.Sequence('sr_psyco_test_tool_used_id_seq', optional=True),
                            primary_key=True),
                        Column('result_id', t.Integer(), ForeignKey(pcSch+'.'+'sr_test_result.id')),
                        Column('tool_id', t.Integer(), ForeignKey(pcSch+'.'+'sr_tool.id')),
                        Column('created_by', t.Integer()),
                        Column('created_date', t.DATETIME()),
                        Column('updated_by', t.Integer()),
                        Column('updated_date', t.DATETIME()),
                        Column('deleted_by', t.Integer()),
                        Column('deleted_date', t.DATETIME()),
                        Column('deleted', t.Boolean(), default=False),
                        schema=pcSch)

# --------------------------
# zone Section
# --------------------------
class ZoneProvince(object):pass
zone_province_tb = Table('sr_province', meta, autoload=True, schema=zSch)

class ZoneAmpur(object):pass
zone_ampur_tb = Table('sr_ampur', meta, autoload=True, schema=zSch)

class ZoneTambon(object):pass
zone_tambon_tb = Table('sr_tambon', meta, autoload=True, schema=zSch)

class ZoneTool(object):
    @staticmethod
    def all(session):
        return session.query(ZoneTool).filter_by(deleted=False).\
            order_by(zone_tool_tb.c.description).all()

zone_tool_tb = Table('sr_tool', meta,
                        Column('id', t.Integer(),
                               sa.Sequence('sr_zone_tool_id_seq', optional=True),
                               primary_key=True),
                        Column('description', t.String(200)),
                        Column('updated_by', t.Integer()),
                        Column('updated_date', t.DATETIME()),
                        Column('deleted_by', t.Integer()),
                        Column('deleted_date', t.DATETIME()),
                        Column('deleted', t.Boolean(), default=False),
                        schema=zSch)

class ZoneSymptom(object):
    @staticmethod
    def all(session):
        return session.query(ZoneSymptom).filter_by(deleted=False).\
            order_by(zone_symptom_tb.c.description).all()

zone_symptom_tb = Table('sr_symptom', meta,
                        Column('id', t.Integer(),
                               sa.Sequence('sr_zone_symptom_id_seq', optional=True),
                               primary_key=True),
                        Column('description', t.String(200)),
                        Column('type', t.Integer()),
                        Column('updated_by', t.Integer()),
                        Column('updated_date', t.DATETIME()),
                        Column('deleted_by', t.Integer()),
                        Column('deleted_date', t.DATETIME()),
                        Column('deleted', t.Boolean(), default=False),
                        schema=zSch)

class ZoneReason(object):
    @staticmethod
    def all(session):
        return session.query(ZoneReason).filter_by(deleted=False).\
            order_by(zone_reason_tb.c.order).all()

zone_reason_tb = Table('sr_reason', meta,
                        Column('id', t.Integer(),
                               sa.Sequence('sr_zone_reason_id_seq', optional=True),
                               primary_key=True),
                        Column('description', t.String(200)),
                        Column('order', t.Integer()),
                        Column('updated_by', t.Integer()),
                        Column('updated_date', t.DATETIME()),
                        Column('deleted_by', t.Integer()),
                        Column('deleted_date', t.DATETIME()),
                        Column('deleted', t.Boolean(), default=False),
                        schema=zSch)

class ZonePersonality(object):
    @staticmethod
    def all(session):
        return session.query(ZonePersonality).filter_by(deleted=False).\
            order_by(zone_personality_tb.c.order).all()

zone_personality_tb = Table('sr_personality', meta,
                        Column('id', t.Integer(),
                               sa.Sequence('sr_zone_personality_id_seq', optional=True),
                               primary_key=True),
                        Column('description', t.String(200)),
                        Column('order', t.Integer()),
                        Column('updated_by', t.Integer()),
                        Column('updated_date', t.DATETIME()),
                        Column('deleted_by', t.Integer()),
                        Column('deleted_date', t.DATETIME()),
                        Column('deleted', t.Boolean(), default=False),
                        schema=zSch)

class ZoneStressManagement(object):
    @staticmethod
    def all(session):
        return session.query(ZoneStressManagement).filter_by(deleted=False).\
            order_by(zone_stress_management_tb.c.order).all()

zone_stress_management_tb = Table('sr_stress_management', meta,
                        Column('id', t.Integer(),
                               sa.Sequence('sr_zone_stress_management_id_seq', optional=True),
                               primary_key=True),
                        Column('description', t.String(200)),
                        Column('order', t.Integer()),
                        Column('updated_by', t.Integer()),
                        Column('updated_date', t.DATETIME()),
                        Column('deleted_by', t.Integer()),
                        Column('deleted_date', t.DATETIME()),
                        Column('deleted', t.Boolean(), default=False),
                        schema=zSch)

class ZoneVisitSymptom(object):
    @staticmethod
    def all(session):
        return session.query(ZoneVisitSymptom).filter_by(deleted=False).\
            order_by(zone_visit_symptom_tb.c.id).all()

zone_visit_symptom_tb = Table('sr_visit_symptom', meta,
                        Column('id', t.Integer(),
                               sa.Sequence('sr_zone_visit_symptom_id_seq', optional=True),
                               primary_key=True),
                        Column('description', t.String(200)),
                        Column('updated_by', t.Integer()),
                        Column('updated_date', t.DATETIME()),
                        Column('deleted_by', t.Integer()),
                        Column('deleted_date', t.DATETIME()),
                        Column('deleted', t.Boolean(), default=False),
                        schema=zSch)

class ZoneMonitoring(object):
    @staticmethod
    def all(session):
        return session.query(ZoneMonitoring).filter_by(deleted=False).\
            order_by(zone_monitoring_tb.c.description).all()

zone_monitoring_tb = Table('sr_monitoring', meta,
                        Column('id', t.Integer(),
                               sa.Sequence('sr_zone_monitoring_id_seq', optional=True),
                               primary_key=True),
                        Column('description', t.String(200)),
                        Column('updated_by', t.Integer()),
                        Column('updated_date', t.DATETIME()),
                        Column('deleted_by', t.Integer()),
                        Column('deleted_date', t.DATETIME()),
                        Column('deleted', t.Boolean(), default=False),
                        schema=zSch)

class ZoneObjective(object):
    @staticmethod
    def all(session):
        return session.query(ZoneObjective).filter_by(deleted=False).\
            order_by(zone_objective_tb.c.order).all()

zone_objective_tb = Table('sr_objective', meta,
                        Column('id', t.Integer(),
                               sa.Sequence('sr_zone_objective_id_seq', optional=True),
                               primary_key=True),
                        Column('description', t.String(200)),
                        Column('order', t.Integer()),
                        Column('updated_by', t.Integer()),
                        Column('updated_date', t.DATETIME()),
                        Column('deleted_by', t.Integer()),
                        Column('deleted_date', t.DATETIME()),
                        Column('deleted', t.Boolean(), default=False),
                        schema=zSch)

class ZoneNewProblem(object):
    @staticmethod
    def all(session):
        return session.query(ZoneNewProblem).filter_by(deleted=False).\
            order_by(zone_new_problem_tb.c.id).all()

zone_new_problem_tb = Table('sr_new_problem', meta,
                        Column('id', t.Integer(),
                               sa.Sequence('sr_zone_new_problem_id_seq', optional=True),
                               primary_key=True),
                        Column('description', t.String(200)),
                        Column('updated_by', t.Integer()),
                        Column('updated_date', t.DATETIME()),
                        Column('deleted_by', t.Integer()),
                        Column('deleted_date', t.DATETIME()),
                        Column('deleted', t.Boolean(), default=False),
                        schema=zSch)

class ZoneProblem(object):
    @staticmethod
    def all(session):
        return session.query(ZoneProblem).filter_by(deleted=False).\
            order_by(zone_problem_tb.c.order).all()

zone_problem_tb = Table('sr_problem', meta,
                        Column('id', t.Integer(),
                               sa.Sequence('sr_zone_problem_id_seq', optional=True),
                               primary_key=True),
                        Column('description', t.String(200)),
                        Column('order', t.Integer()),
                        Column('updated_by', t.Integer()),
                        Column('updated_date', t.DATETIME()),
                        Column('deleted_by', t.Integer()),
                        Column('deleted_date', t.DATETIME()),
                        Column('deleted', t.Boolean(), default=False),
                        schema=zSch)

class ZoneCondition(object):
    @staticmethod
    def all(session):
        return session.query(ZoneCondition).filter_by(deleted=False).\
            order_by(zone_condition_tb.c.id).all()

zone_condition_tb = Table('sr_condition', meta,
                        Column('id', t.Integer(),
                               sa.Sequence('sr_zone_condition_id_seq', optional=True),
                               primary_key=True),
                        Column('description', t.String(200)),
                        Column('updated_by', t.Integer()),
                        Column('updated_date', t.DATETIME()),
                        Column('deleted_by', t.Integer()),
                        Column('deleted_date', t.DATETIME()),
                        Column('deleted', t.Boolean(), default=False),
                        schema=zSch)

class ZoneRefer(object): pass
zone_refer_tb = Table('sr_refer', meta,
                        Column('id', t.Integer(),
                               sa.Sequence('sr_zone_refer_id_seq', optional=True),
                               primary_key=True),
                        #Column('vn_id', t.Integer(), ForeignKey(mrSch+'.'+'nano_visit.id')),
                        Column('pa_id', t.Integer(), ForeignKey(mrSch+'.'+'nano_patient.id')),
                        Column('monitor_id', t.Integer(), ForeignKey(zSch+'.'+'sr_monitoring.id')),
                        Column('monitor_remark', t.String(200)),
                        Column('is_municipality', t.Boolean(), default=False),
                        Column('landmark', t.String(200)),
                        Column('last_visit_date', t.DATETIME()),
                        Column('last_admit_date', t.DATETIME()),
                        Column('last_discharge_date', t.DATETIME()),
                        Column('symptom', t.Text()),
                        Column('diag', t.Text()),
                        Column('homemed', t.Text()),
                        Column('homemed_month', t.String(200)),
                        Column('score_8q', t.String(200)),
                        Column('score_9q', t.String(200)),
                        Column('dis_score_8q', t.String(200)),
                        Column('ds8', t.String(200)),
                        Column('dis_ds8', t.String(200)),
                        Column('remed_date', t.DATETIME()),
                        Column('suggestion', t.Text()),
                        Column('help', t.Text()),
                        Column('help_opd', t.Text()),
                        Column('is_permitted', t.Boolean(), default=False),
                        Column('network_name', t.String(200)),
                        Column('network_unit', t.String(200)),
                        Column('network_ampur', t.String(200)),
                        Column('network_province', t.String(200)),
                        Column('network_tel', t.String(200)),
                        Column('created_by', t.Integer()),
                        Column('created_date', t.DATETIME()),
                        Column('updated_by', t.Integer()),
                        Column('updated_date', t.DATETIME()),
                        Column('deleted_by', t.Integer()),
                        Column('deleted_date', t.DATETIME()),
                        Column('deleted', t.Boolean(), default=False),
                        schema=zSch)

class ZoneReferNetwork(object): pass
zone_refer_network_tb = Table('sr_refer_network', meta,
                        Column('id', t.Integer(),
                               sa.Sequence('sr_zone_refer_network_id_seq', optional=True),
                               primary_key=True),
                        Column('refer_id', t.Integer(), ForeignKey(zSch+'.'+'sr_refer.id')),
                        Column('refer_date', t.DATETIME()),
                        Column('updated_by', t.Integer()),
                        Column('updated_date', t.DATETIME()),
                        Column('deleted_by', t.Integer()),
                        Column('deleted_date', t.DATETIME()),
                        Column('deleted', t.Boolean(), default=False),
                        schema=zSch)

class ZoneReferTool(object): pass
zone_refer_tool_tb = Table('sr_refer_tool', meta,
                        Column('id', t.Integer(),
                               sa.Sequence('sr_zone_refer_tool_id_seq', optional=True),
                               primary_key=True),
                        Column('refer_id', t.Integer(), ForeignKey(zSch+'.'+'sr_refer.id')),
                        Column('tool_id', t.Integer(), ForeignKey(zSch+'.'+'sr_tool.id')),
                        Column('remark', t.String(255)),
                        Column('before', t.String(255)),
                        Column('after', t.String(255)),
                        Column('updated_by', t.Integer()),
                        Column('updated_date', t.DATETIME()),
                        Column('deleted_by', t.Integer()),
                        Column('deleted_date', t.DATETIME()),
                        Column('deleted', t.Boolean(), default=False),
                        schema=zSch)

class ZoneReferRelative(object): pass
zone_refer_relative_tb = Table('sr_refer_relative', meta,
                        Column('id', t.Integer(),
                               sa.Sequence('sr_zone_refer_relative_id_seq', optional=True),
                               primary_key=True),
                        Column('refer_id', t.Integer(), ForeignKey(zSch+'.'+'sr_refer.id')),
                        Column('name', t.String(200)),
                        Column('relationship', t.String(200)),
                        Column('is_same', t.Boolean(), default=False),
                        Column('addr_no', t.String(20)),
                        Column('moo', t.String(20)),
                        Column('village', t.String(50)),
                        Column('tambon', t.String(50)),
                        Column('ampur', t.String(50)),
                        Column('province', t.String(50)),
                        Column('tel', t.String(50)),
                        Column('updated_by', t.Integer()),
                        Column('updated_date', t.DATETIME()),
                        Column('deleted_by', t.Integer()),
                        Column('deleted_date', t.DATETIME()),
                        Column('deleted', t.Boolean(), default=False),
                        schema=zSch)

class ZoneReferResult(object): pass
zone_refer_result_tb = Table('sr_refer_result', meta,
                        Column('id', t.Integer(),
                               sa.Sequence('sr_zone_refer_result_id_seq', optional=True),
                               primary_key=True),
                        #Column('vn_id', t.Integer(), ForeignKey(mrSch+'.'+'nano_visit.id')),
                        Column('pa_id', t.Integer(), ForeignKey(mrSch+'.'+'nano_patient.id')),
                        Column('refer_id', t.Integer(), ForeignKey(zSch+'.'+'sr_refer.id')),
                        Column('no', t.Integer()),
                        Column('visit_date', t.DATETIME()),
                        Column('score_9q', t.String(200)),
                        Column('score_8q', t.String(200)),
                        Column('lack', t.Boolean()),
                        Column('drug_effect', t.String(200)),
                        Column('problem', t.String(200)),
                        Column('help', t.String(200)),
                        Column('updated_by', t.Integer()),
                        Column('updated_date', t.DATETIME()),
                        Column('deleted_by', t.Integer()),
                        Column('deleted_date', t.DATETIME()),
                        Column('deleted', t.Boolean(), default=False),
                        schema=zSch)

class ZoneVisitRequest(object):pass
zone_visit_request_tb = Table('sr_visit_request', meta,
                        Column('id', t.Integer(),
                               sa.Sequence('sr_zone_visit_request_id_seq', optional=True),
                               primary_key=True),
                        #Column('vn_id', t.Integer(), ForeignKey(mrSch+'.'+'nano_visit.id')),
                        Column('pa_id', t.Integer(), ForeignKey(mrSch+'.'+'nano_patient.id')),
                        Column('request_date', t.DATETIME()),
                        Column('problem_date', t.DATETIME()),
                        Column('request_no', t.String(20)),
                        Column('symptom', t.Text()),
                        Column('last_admit_date', t.DATETIME()),
                        Column('last_discharge_date', t.DATETIME()),
                        Column('diag', t.Text()),
                        Column('med', t.Text()),
                        Column('lab_result', t.Text()),
                        Column('remark', t.Text()),
                        Column('reason', t.Text()),
                        Column('is_permitted', t.Boolean()),
                        Column('officer_limit', t.Boolean()),
                        Column('cond_remark', t.String(200)),
                        Column('first_8q', t.String(200)),
                        Column('first_9q', t.String(200)),
                        Column('last_8q', t.String(200)),
                        Column('last_9q', t.String(200)),
                        Column('self_harm', t.String(255)),
                        Column('self_harm_method', t.String(500)),
                        Column('discharge_symptom', t.String(500)),
                        Column('want_self_harm', t.String(500)),
                        Column('complicated_problem', t.String(200)),
                        Column('suggestion', t.String(200)),
                        Column('relative_name', t.String(200)),
                        Column('relationship', t.String(200)),
                        Column('is_same', t.Boolean(), default=False),
                        Column('addr_no', t.String(20)),
                        Column('moo', t.String(20)),
                        Column('village', t.String(50)),
                        Column('tambon', t.String(50)),
                        Column('ampur', t.String(50)),
                        Column('province', t.String(50)),
                        Column('tel', t.String(50)),
                        Column('network_name', t.String(200)),
                        Column('network_unit', t.String(200)),
                        Column('network_ampur', t.String(200)),
                        Column('network_province', t.String(200)),
                        Column('network_tel', t.String(200)),
                        Column('updated_by', t.Integer()),
                        Column('updated_date', t.DATETIME()),
                        Column('deleted_by', t.Integer()),
                        Column('deleted_date', t.DATETIME()),
                        Column('deleted', t.Boolean(), default=False),
                        schema=zSch)

class ZoneRequestTool(object): pass
zone_request_tool_tb = Table('sr_request_tool', meta,
                        Column('id', t.Integer(),
                               sa.Sequence('sr_zone_request_tool_id_seq', optional=True),
                               primary_key=True),
                        Column('req_id', t.Integer(), ForeignKey(zSch+'.'+'sr_visit_request.id')),
                        Column('tool_id', t.Integer(), ForeignKey(zSch+'.'+'sr_tool.id')),
                        Column('remark', t.String(255)),
                        Column('before', t.String(255)),
                        Column('after', t.String(255)),
                        Column('updated_by', t.Integer()),
                        Column('updated_date', t.DATETIME()),
                        Column('deleted_by', t.Integer()),
                        Column('deleted_date', t.DATETIME()),
                        Column('deleted', t.Boolean(), default=False),
                        schema=zSch)


class ZoneRequestProblem(object): pass
zone_request_problem_tb = Table('sr_request_problem', meta,
                        Column('id', t.Integer(),
                               sa.Sequence('sr_zone_request_problem_id_seq', optional=True),
                               primary_key=True),
                        Column('req_id', t.Integer(), ForeignKey(zSch+'.'+'sr_visit_request.id')),
                        Column('problem_id', t.Integer(), ForeignKey(zSch+'.'+'sr_problem.id')),
                        Column('problem_date', t.DATETIME()),
                        Column('remark', t.String(200)),
                        Column('activity', t.String(200)),
                        Column('result', t.String(200)),
                        Column('employee', t.String(200)),
                        Column('updated_by', t.Integer()),
                        Column('updated_date', t.DATETIME()),
                        Column('deleted_by', t.Integer()),
                        Column('deleted_date', t.DATETIME()),
                        Column('deleted', t.Boolean(), default=False),
                        schema=zSch)

class ZoneVisitResult(object): pass
zone_visit_result_tb = Table('sr_visit_result', meta,
                        Column('id', t.Integer(),
                               sa.Sequence('sr_zone_visit_result_id_seq', optional=True),
                               primary_key=True),
                        #Column('vn_id', t.Integer(), ForeignKey(mrSch+'.'+'nano_visit.id')),
                        Column('pa_id', t.Integer(), ForeignKey(mrSch+'.'+'nano_patient.id')),
                        Column('request_id', t.Integer(), ForeignKey(zSch+'.'+'sr_visit_request.id')),
                        Column('no', t.Integer()),
                        Column('visit_date', t.DATETIME()),
                        Column('from_time', t.String(20)),
                        Column('to_time', t.String(20)),
                        Column('is_rated', t.Boolean()),
                        Column('informant', t.String(200)),
                        Column('relationship', t.String(200)),
                        Column('environment', t.Text()),
                        Column('history_family', t.Text()),
                        Column('environment', t.Text()),
                        Column('heredity', t.Text()),
                        Column('family_relationship', t.Text()),
                        Column('community_relationship', t.Text()),
                        Column('factor', t.Text()),
                        Column('drug_usage', t.Text()),
                        Column('history_mental', t.Text()),
                        Column('history_physical', t.Text()),
                        Column('current_symptom', t.Text()),
                        Column('score_8q', t.String(200)),
                        Column('score_9q', t.String(200)),
                        Column('problem_patient', t.Text()),
                        Column('problem_relative', t.Text()),
                        Column('problem_other', t.Text()),
                        Column('support', t.Text()),
                        Column('remark', t.Text()),
                        Column('reason_remark', t.String(200)),
                        Column('objective_remark', t.String(200)),
                        Column('personality_remark', t.String(200)),
                        Column('stress_remark', t.String(200)),
                        Column('is_stop', t.Boolean()),
                        Column('next_visit_date', t.DATETIME()),
                        Column('updated_by', t.Integer()),
                        Column('updated_date', t.DATETIME()),
                        Column('deleted_by', t.Integer()),
                        Column('deleted_date', t.DATETIME()),
                        Column('deleted', t.Boolean(), default=False),
                        schema=zSch)

class ZoneResultVisitor(object): pass
zone_result_visitor_tb = Table('sr_result_visitor', meta,
                        Column('id', t.Integer(),
                               sa.Sequence('sr_zone_result_visitor_id_seq', optional=True),
                               primary_key=True),
                        Column('result_id', t.Integer(), ForeignKey(zSch+'.'+'sr_visit_result.id')),
                        Column('visitor', t.String(200)),
                        Column('position', t.String(200)),
                        Column('workplace', t.String(200)),
                        Column('updated_by', t.Integer()),
                        Column('updated_date', t.DATETIME()),
                        Column('deleted_by', t.Integer()),
                        Column('deleted_date', t.DATETIME()),
                        Column('deleted', t.Boolean(), default=False),
                        schema=zSch)

class ZoneVisitCondition(object): pass
zone_visit_condition_tb = Table('sr_visit_condition', meta,
                        Column('id', t.Integer(),
                               sa.Sequence('sr_zone_visit_condition_id_seq', optional=True),
                               primary_key=True),
                        Column('request_id', t.Integer(), ForeignKey(zSch+'.'+'sr_visit_request.id')),
                        Column('condition_id', t.Integer(), ForeignKey(zSch+'.'+'sr_condition.id')),
                        Column('remark', t.String(200)),
                        Column('updated_by', t.Integer()),
                        Column('updated_date', t.DATETIME()),
                        Column('deleted_by', t.Integer()),
                        Column('deleted_date', t.DATETIME()),
                        Column('deleted', t.Boolean(), default=False),
                        schema=zSch)

class ZoneVisitProblem(object): pass
zone_visit_problem_tb = Table('sr_visit_problem', meta,
                        Column('id', t.Integer(),
                               sa.Sequence('sr_zone_visit_problem_id_seq', optional=True),
                               primary_key=True),
                        Column('request_id', t.Integer(), ForeignKey(zSch+'.'+'sr_visit_request.id')),
                        Column('problem_id', t.Integer(), ForeignKey(zSch+'.'+'sr_new_problem.id')),
                        Column('remark', t.String(200)),
                        Column('updated_by', t.Integer()),
                        Column('updated_date', t.DATETIME()),
                        Column('deleted_by', t.Integer()),
                        Column('deleted_date', t.DATETIME()),
                        Column('deleted', t.Boolean(), default=False),
                        schema=zSch)

class ZoneVisitReason(object): pass
zone_visit_reason_tb = Table('sr_visit_reason', meta,
                        Column('id', t.Integer(),
                               sa.Sequence('sr_zone_visit_reason_id_seq', optional=True),
                               primary_key=True),
                        Column('result_id', t.Integer(), ForeignKey(zSch+'.'+'sr_visit_result.id')),
                        Column('reason_id', t.Integer(), ForeignKey(zSch+'.'+'sr_reason.id')),
                        Column('remark', t.String(200)),
                        Column('updated_by', t.Integer()),
                        Column('updated_date', t.DATETIME()),
                        Column('deleted_by', t.Integer()),
                        Column('deleted_date', t.DATETIME()),
                        Column('deleted', t.Boolean(), default=False),
                        schema=zSch)

class ZoneVisitObjective(object): pass
zone_visit_objective_tb = Table('sr_visit_objective', meta,
                        Column('id', t.Integer(),
                               sa.Sequence('sr_zone_visit_objective_id_seq', optional=True),
                               primary_key=True),
                        Column('result_id', t.Integer(), ForeignKey(zSch+'.'+'sr_visit_result.id')),
                        Column('objective_id', t.Integer(), ForeignKey(zSch+'.'+'sr_objective.id')),
                        Column('remark', t.String(200)),
                        Column('updated_by', t.Integer()),
                        Column('updated_date', t.DATETIME()),
                        Column('deleted_by', t.Integer()),
                        Column('deleted_date', t.DATETIME()),
                        Column('deleted', t.Boolean(), default=False),
                        schema=zSch)

class ZoneVisitFamily(object): pass
zone_visit_family_tb = Table('sr_visit_family', meta,
                        Column('id', t.Integer(),
                               sa.Sequence('sr_zone_visit_family_id_seq', optional=True),
                               primary_key=True),
                        Column('result_id', t.Integer(), ForeignKey(zSch+'.'+'sr_visit_result.id')),
                        Column('name', t.String(200)),
                        Column('relationship', t.String(200)),
                        Column('updated_by', t.Integer()),
                        Column('updated_date', t.DATETIME()),
                        Column('deleted_by', t.Integer()),
                        Column('deleted_date', t.DATETIME()),
                        Column('deleted', t.Boolean(), default=False),
                        schema=zSch)

class ZoneVisitLeader(object): pass
zone_visit_leader_tb = Table('sr_visit_leader', meta,
                        Column('id', t.Integer(),
                               sa.Sequence('sr_zone_visit_leader_id_seq', optional=True),
                               primary_key=True),
                        Column('result_id', t.Integer(), ForeignKey(zSch+'.'+'sr_visit_result.id')),
                        Column('name', t.String(200)),
                        Column('updated_by', t.Integer()),
                        Column('updated_date', t.DATETIME()),
                        Column('deleted_by', t.Integer()),
                        Column('deleted_date', t.DATETIME()),
                        Column('deleted', t.Boolean(), default=False),
                        schema=zSch)

class ZoneVisitPersonality(object): pass
zone_visit_personality_tb = Table('sr_visit_personality', meta,
                        Column('id', t.Integer(),
                               sa.Sequence('sr_zone_visit_personality_id_seq', optional=True),
                               primary_key=True),
                        Column('result_id', t.Integer(), ForeignKey(zSch+'.'+'sr_visit_result.id')),
                        Column('personality_id', t.Integer(), ForeignKey(zSch+'.'+'sr_personality.id')),
                        Column('updated_by', t.Integer()),
                        Column('updated_date', t.DATETIME()),
                        Column('deleted_by', t.Integer()),
                        Column('deleted_date', t.DATETIME()),
                        Column('deleted', t.Boolean(), default=False),
                        schema=zSch)

class ZoneVisitStress(object): pass
zone_visit_stress_tb = Table('sr_visit_stress', meta,
                        Column('id', t.Integer(),
                               sa.Sequence('sr_zone_visit_stress_id_seq', optional=True),
                               primary_key=True),
                        Column('result_id', t.Integer(), ForeignKey(zSch+'.'+'sr_visit_result.id')),
                        Column('stress_id', t.Integer(), ForeignKey(zSch+'.'+'sr_stress_management.id')),
                        Column('updated_by', t.Integer()),
                        Column('updated_date', t.DATETIME()),
                        Column('deleted_by', t.Integer()),
                        Column('deleted_date', t.DATETIME()),
                        Column('deleted', t.Boolean(), default=False),
                        schema=zSch)

class ZoneVisitHelp(object): pass
zone_visit_help_tb = Table('sr_visit_help', meta,
                        Column('id', t.Integer(),
                               sa.Sequence('sr_zone_visit_help_id_seq', optional=True),
                               primary_key=True),
                        Column('result_id', t.Integer(), ForeignKey(zSch+'.'+'sr_visit_result.id')),
                        Column('problem', t.String(250)),
                        Column('help', t.String(250)),
                        Column('assessment', t.String(250)),
                        Column('updated_by', t.Integer()),
                        Column('updated_date', t.DATETIME()),
                        Column('deleted_by', t.Integer()),
                        Column('deleted_date', t.DATETIME()),
                        Column('deleted', t.Boolean(), default=False),
                        schema=zSch)

class ZonePatientSymptom(object): pass
zone_patient_symptom_tb = Table('sr_patient_symptom', meta,
                        Column('id', t.Integer(),
                               sa.Sequence('sr_zone_patient_symptom_id_seq', optional=True),
                               primary_key=True),
                        #Column('vn_id', t.Integer(), ForeignKey(mrSch+'.'+'nano_visit.id')),
                        Column('pa_id', t.Integer(), ForeignKey(mrSch+'.'+'nano_patient.id')),
                        Column('symptom_id', t.Integer(), ForeignKey(zSch+'.'+'sr_symptom.id')),
                        Column('problem', t.String(1000)),
                        Column('updated_by', t.Integer()),
                        Column('updated_date', t.DATETIME()),
                        Column('deleted_by', t.Integer()),
                        Column('deleted_date', t.DATETIME()),
                        Column('deleted', t.Boolean(), default=False),
                        schema=zSch)

# --------------------------
# psychosocial Section
# --------------------------
class PSDrug(object):
    @staticmethod
    def all(session):
        return session.query(PSDrug).filter_by(deleted=False).\
            order_by(ps_drug_tb.c.id).all()

ps_drug_tb = Table('sr_drug', meta,
                        Column('id', t.Integer(),
                               sa.Sequence('sr_ps_drug_id_seq', optional=True),
                               primary_key=True),
                        Column('description', t.String(200)),
                        Column('updated_by', t.Integer()),
                        Column('updated_date', t.DATETIME()),
                        Column('deleted_by', t.Integer()),
                        Column('deleted_date', t.DATETIME()),
                        Column('deleted', t.Boolean(), default=False),
                        schema=psSch)

class PSType(object):
    @staticmethod
    def all(session):
        return session.query(PSType).filter_by(deleted=False).\
            order_by(ps_type_tb.c.id).all()

ps_type_tb = Table('sr_type', meta,
                        Column('id', t.Integer(),
                               sa.Sequence('sr_ps_type_id_seq', optional=True),
                               primary_key=True),
                        Column('description', t.String(200)),
                        Column('updated_by', t.Integer()),
                        Column('updated_date', t.DATETIME()),
                        Column('deleted_by', t.Integer()),
                        Column('deleted_date', t.DATETIME()),
                        Column('deleted', t.Boolean(), default=False),
                        schema=psSch)

class PSMethod(object):
    @staticmethod
    def all(session):
        return session.query(PSMethod).filter_by(deleted=False).\
            order_by(ps_method_tb.c.id).all()

ps_method_tb = Table('sr_method', meta,
                        Column('id', t.Integer(),
                               sa.Sequence('sr_ps_method_id_seq', optional=True),
                               primary_key=True),
                        Column('description', t.String(200)),
                        Column('parent_id', t.Integer()),
                        Column('updated_by', t.Integer()),
                        Column('updated_date', t.DATETIME()),
                        Column('deleted_by', t.Integer()),
                        Column('deleted_date', t.DATETIME()),
                        Column('deleted', t.Boolean(), default=False),
                        schema=psSch)

class PSEntrance(object):
    @staticmethod
    def all(session):
        return session.query(PSEntrance).filter_by(deleted=False).\
            order_by(ps_entrance_tb.c.id).all()

ps_entrance_tb = Table('sr_entrance', meta,
                        Column('id', t.Integer(),
                               sa.Sequence('sr_ps_entrance_id_seq', optional=True),
                               primary_key=True),
                        Column('description', t.String(200)),
                        Column('updated_by', t.Integer()),
                        Column('updated_date', t.DATETIME()),
                        Column('deleted_by', t.Integer()),
                        Column('deleted_date', t.DATETIME()),
                        Column('deleted', t.Boolean(), default=False),
                        schema=psSch)

class PSAssessment(object):
    @staticmethod
    def all(session):
        return session.query(PSAssessment).filter_by(deleted=False).\
            order_by(ps_assessment_tb.c.id).all()

ps_assessment_tb = Table('sr_assessment', meta,
                        Column('id', t.Integer(),
                               sa.Sequence('sr_ps_assessment_id_seq', optional=True),
                               primary_key=True),
                        Column('description', t.String(200)),
                        Column('updated_by', t.Integer()),
                        Column('updated_date', t.DATETIME()),
                        Column('deleted_by', t.Integer()),
                        Column('deleted_date', t.DATETIME()),
                        Column('deleted', t.Boolean(), default=False),
                        schema=psSch)

class PSResult(object):
    @staticmethod
    def all(session):
        return session.query(PSResult).filter_by(deleted=False).\
            order_by(ps_result_tb.c.id).all()

ps_result_tb = Table('sr_result', meta,
                        Column('id', t.Integer(),
                               sa.Sequence('sr_ps_result_id_seq', optional=True),
                               primary_key=True),
                        Column('description', t.String(200)),
                        Column('updated_by', t.Integer()),
                        Column('updated_date', t.DATETIME()),
                        Column('deleted_by', t.Integer()),
                        Column('deleted_date', t.DATETIME()),
                        Column('deleted', t.Boolean(), default=False),
                        schema=psSch)

class PSCancelReason(object):
    @staticmethod
    def all(session):
        return session.query(PSCancelReason).filter_by(deleted=False).\
            order_by(ps_cancel_reason_tb.c.id).all()

ps_cancel_reason_tb = Table('sr_cancel_reason', meta,
                        Column('id', t.Integer(),
                               sa.Sequence('sr_ps_cancel_reason_id_seq', optional=True),
                               primary_key=True),
                        Column('description', t.String(200)),
                        Column('updated_by', t.Integer()),
                        Column('updated_date', t.DATETIME()),
                        Column('deleted_by', t.Integer()),
                        Column('deleted_date', t.DATETIME()),
                        Column('deleted', t.Boolean(), default=False),
                        schema=psSch)

class PSFollowup(object):
    @staticmethod
    def all(session):
        return session.query(PSFollowup).filter_by(deleted=False).\
            order_by(ps_followup_tb.c.id).all()

ps_followup_tb = Table('sr_followup', meta,
                        Column('id', t.Integer(),
                               sa.Sequence('sr_ps_followup_id_seq', optional=True),
                               primary_key=True),
                        Column('description', t.String(200)),
                        Column('updated_by', t.Integer()),
                        Column('updated_date', t.DATETIME()),
                        Column('deleted_by', t.Integer()),
                        Column('deleted_date', t.DATETIME()),
                        Column('deleted', t.Boolean(), default=False),
                        schema=psSch)

class PSNumber(object):
    @staticmethod
    def all(session):
        return session.query(PSNumber).filter_by(deleted=False).\
            order_by(ps_number_tb.c.id).all()

ps_number_tb = Table('sr_number', meta,
                        Column('id', t.Integer(),
                               sa.Sequence('sr_ps_number_id_seq', optional=True),
                               primary_key=True),
                        Column('number', t.Integer()),
                        Column('updated_by', t.Integer()),
                        Column('updated_date', t.DATETIME()),
                        Column('deleted_by', t.Integer()),
                        Column('deleted_date', t.DATETIME()),
                        Column('deleted', t.Boolean(), default=False),
                        schema=psSch)

#class PSAssessmentDrug(object):pass
#ps_assessment_drug_tb = Table('sr_assessment_drug', meta,
#                        Column('id', t.Integer(),
#                               sa.Sequence('sr_ps_assessment_drug_id_seq', optional=True),
#                               primary_key=True),
#                        Column('assessment_id', t.Integer(), ForeignKey(psSch+'.'+'sr_patient_assessment.id')),
#                        Column('drug_id', t.Integer(), ForeignKey(psSch+'.'+'sr_drug.id')),
#                        Column('updated_by', t.Integer()),
#                        Column('updated_date', t.DATETIME()),
#                        Column('deleted_by', t.Integer()),
#                       Column('deleted_date', t.DATETIME()),
#                        Column('deleted', t.Boolean(), default=False),
#                       schema=psSch)

class PSPatientAssessment(object):pass
ps_patient_assessment_tb = Table('sr_patient_assessment', meta,
                        Column('id', t.Integer(),
                               sa.Sequence('sr_ps_patient_assessment_id_seq', optional=True),
                               primary_key=True),
                        Column('vn_id', t.Integer(), ForeignKey(mrSch+'.'+'nano_visit.id')),
                        Column('pa_id', t.Integer(), ForeignKey(mrSch+'.'+'nano_patient.id')),
                        Column('assess_date', t.DATETIME()),
                        Column('drug_id', t.Integer(), ForeignKey(psSch+'.'+'sr_drug.id')),
                        Column('drug_type', t.String(200)),
                        Column('drug_period', t.String(200)),
                        Column('drug_qty', t.String(200)),
                        Column('drug_freq', t.String(200)),
                        Column('entrance_id', t.Integer(), ForeignKey(psSch+'.'+'sr_entrance.id')),
                        Column('updated_by', t.Integer()),
                        Column('updated_date', t.DATETIME()),
                        Column('deleted_by', t.Integer()),
                        Column('deleted_date', t.DATETIME()),
                        Column('deleted', t.Boolean(), default=False),
                        schema=psSch)

class PSTreatmentAssessment(object):pass
ps_treatment_assessment_tb = Table('sr_treatment_assessment', meta,
                        Column('id', t.Integer(),
                               sa.Sequence('sr_ps_treatment_assessment_id_seq', optional=True),
                               primary_key=True),
                        Column('patient_assessment_id', t.Integer(), ForeignKey(psSch+'.'+'sr_patient_assessment.id')),
                        Column('assessment_id', t.Integer(), ForeignKey(psSch+'.'+'sr_assessment.id')),
                        Column('updated_by', t.Integer()),
                        Column('updated_date', t.DATETIME()),
                        Column('deleted_by', t.Integer()),
                        Column('deleted_date', t.DATETIME()),
                        Column('deleted', t.Boolean(), default=False),
                        schema=psSch)

class PSAssessmentResult(object):pass
ps_assessment_result_tb = Table('sr_assessment_result', meta,
                        Column('id', t.Integer(),
                               sa.Sequence('sr_ps_assessment_result_id_seq', optional=True),
                               primary_key=True),
                        Column('patient_assessment_id', t.Integer(), ForeignKey(psSch+'.'+'sr_patient_assessment.id')),
                        Column('pa_id', t.Integer(), ForeignKey(mrSch+'.'+'nano_patient.id')),
                        Column('vn_id', t.Integer(), ForeignKey(mrSch+'.'+'nano_visit.id')),
                        Column('type_id', t.Integer(), ForeignKey(psSch+'.'+'sr_type.id')),
                        Column('method_id', t.Integer(), ForeignKey(psSch+'.'+'sr_method.id')),
                        Column('number_id', t.Integer(), ForeignKey(psSch+'.'+'sr_number.id')),
                        Column('is_ready', t.Boolean()),
                        Column('assess_date', t.DATETIME()),
                        Column('is_complete', t.Boolean()),
                        Column('cancel_id', t.Integer(), ForeignKey(psSch+'.'+'sr_cancel_reason.id')),
                        Column('cancel_remark', t.String(200)),
                        Column('complete_date', t.DATETIME()),
                        Column('result', t.Text()),
                        Column('conclusion', t.Text()),
                        Column('appoint_date', t.DATETIME()),
                        Column('updated_by', t.Integer()),
                        Column('updated_date', t.DATETIME()),
                        Column('deleted_by', t.Integer()),
                        Column('deleted_date', t.DATETIME()),
                        Column('deleted', t.Boolean(), default=False),
                        schema=psSch)

class PSFollowingPlan(object):pass
ps_following_plan_tb = Table('sr_following_plan', meta,
                        Column('id', t.Integer(),
                               sa.Sequence('sr_ps_following_plan_id_seq', optional=True),
                               primary_key=True),
                        Column('ar_id', t.Integer(), ForeignKey(psSch+'.'+'sr_assessment_result.id')),
                        Column('month', t.String(200)),
                        Column('year', t.String(4)),
                        schema=psSch)

class PSPatientTreatment(object):pass
ps_patient_treatment_tb = Table('sr_patient_treatment', meta,
                        Column('id', t.Integer(),
                               sa.Sequence('sr_ps_patient_treatment_id_seq', optional=True),
                               primary_key=True),
                        Column('assessment_result_id', t.Integer(), ForeignKey(psSch+'.'+'sr_assessment_result.id')),
                        Column('pa_id', t.Integer(), ForeignKey(mrSch+'.'+'nano_patient.id')),
                        Column('vn_id', t.Integer(), ForeignKey(mrSch+'.'+'nano_visit.id')),
                        Column('treatment_date', t.DATETIME()),
                        Column('updated_by', t.Integer()),
                        Column('updated_date', t.DATETIME()),
                        Column('deleted_by', t.Integer()),
                        Column('deleted_date', t.DATETIME()),
                        Column('deleted', t.Boolean(), default=False),
                        schema=psSch)

class PSTreatmentMethod(object):pass
ps_treatment_method_tb = Table('sr_treatment_method', meta,
                        Column('id', t.Integer(),
                               sa.Sequence('sr_ps_treatment_method_id_seq', optional=True),
                               primary_key=True),
                        Column('patient_treatment_id', t.Integer(), ForeignKey(psSch+'.'+'sr_patient_treatment.id')),
                        Column('method_id', t.Integer(), ForeignKey(psSch+'.'+'sr_method.id')),
                        Column('updated_by', t.Integer()),
                        Column('updated_date', t.DATETIME()),
                        Column('deleted_by', t.Integer()),
                        Column('deleted_date', t.DATETIME()),
                        Column('deleted', t.Boolean(), default=False),
                        schema=psSch)

class PSPatientFollowup(object):pass
ps_patient_followup_tb = Table('sr_patient_followup', meta,
                        Column('id', t.Integer(),
                               sa.Sequence('sr_ps_patient_followup_id_seq', optional=True),
                               primary_key=True),
                        Column('assessment_result_id', t.Integer(), ForeignKey(psSch+'.'+'sr_assessment_result.id')),
                        Column('pa_id', t.Integer(), ForeignKey(mrSch+'.'+'nano_patient.id')),
                        Column('vn_id', t.Integer(), ForeignKey(mrSch+'.'+'nano_visit.id')),
                        Column('followup_no', t.Integer()),
                        Column('followup_date', t.DATETIME()),
                        Column('updated_by', t.Integer()),
                        Column('updated_date', t.DATETIME()),
                        Column('deleted_by', t.Integer()),
                        Column('deleted_date', t.DATETIME()),
                        Column('deleted', t.Boolean(), default=False),
                        schema=psSch)

class PSTreatmentFollowup(object):pass
ps_treatment_followup_tb = Table('sr_treatment_followup', meta,
                        Column('id', t.Integer(),
                               sa.Sequence('sr_ps_treatment_followup_id_seq', optional=True),
                               primary_key=True),
                        Column('patient_followup_id', t.Integer(), ForeignKey(psSch+'.'+'sr_patient_followup.id')),
                        Column('followup_id', t.Integer(), ForeignKey(psSch+'.'+'sr_followup.id')),
                        Column('updated_by', t.Integer()),
                        Column('updated_date', t.DATETIME()),
                        Column('deleted_by', t.Integer()),
                        Column('deleted_date', t.DATETIME()),
                        Column('deleted', t.Boolean(), default=False),
                        schema=psSch)

#class PSAssessmentResultMethod(object):pass
#ps_assessment_result_method_tb = Table('sr_assessment_result_method', meta,
#                        Column('id', t.Integer(),
#                               sa.Sequence('sr_ps_assessment_result_method_id_seq', optional=True),
#                               primary_key=True),
#                        Column('result_id', t.Integer(), ForeignKey(psSch+'.'+'sr_assessment_result.id')),
#                        Column('method_id', t.Integer(), ForeignKey(psSch+'.'+'sr_method.id')),
#                       Column('updated_by', t.Integer()),
#                        Column('updated_date', t.DATETIME()),
#                        Column('deleted_by', t.Integer()),
#                        Column('deleted_date', t.DATETIME()),
#                        Column('deleted', t.Boolean(), default=False),
#                        schema=psSch)

class PSAppointment(object):pass
ps_appointment_tb = Table('sr_appointment', meta,
                        Column('id', t.Integer(),
                               sa.Sequence('sr_ps_appointment_id_seq', optional=True),
                               primary_key=True),
                        Column('pa_id', t.Integer(), ForeignKey(mrSch+'.'+'nano_patient.id')),
                        Column('appoint_date', t.DATETIME()),
                        Column('remark', t.String(200)),
                        Column('updated_by', t.Integer()),
                        Column('updated_date', t.DATETIME()),
                        Column('deleted_by', t.Integer()),
                        Column('deleted_date', t.DATETIME()),
                        Column('deleted', t.Boolean(), default=False),
                        schema=psSch)

#class PSTreatmentResult(object):pass
#ps_treatment_result_tb = Table('sr_treatment_result', meta,
#                        Column('id', t.Integer(),
#                               sa.Sequence('sr_ps_treatment_result_id_seq', optional=True),
#                               primary_key=True),
#                        Column('assessment_result_id', t.Integer(), ForeignKey(psSch+'.'+'sr_assessment_result.id')),
#                        Column('pa_id', t.Integer(), ForeignKey(mrSch+'.'+'nano_patient.id')),
#                        Column('result_id', t.Integer(), ForeignKey(psSch+'.'+'sr_result.id')),
#                        Column('cancel_id', t.Integer(), ForeignKey(psSch+'.'+'sr_cancel_reason.id')),
#                        Column('cancel_remark', t.String(200)),
#                        Column('updated_by', t.Integer()),
#                        Column('updated_date', t.DATETIME()),
#                        Column('deleted_by', t.Integer()),
#                        Column('deleted_date', t.DATETIME()),
#                        Column('deleted', t.Boolean(), default=False),
#                        schema=psSch)

# --------------------------
# X-ray Section
# --------------------------

class XrayPart(object):
    @staticmethod
    def all(session):
        return session.query(XrayPart).filter_by(deleted=False).\
            order_by(xray_part_tb.c.description).all()

xray_part_tb = Table('sr_part', meta,
                        Column('id', t.Integer(),
                               sa.Sequence('sr_xray_part_id_seq', optional=True),
                               primary_key=True),
                        Column('description', t.String(200)),
                        Column('updated_by', t.Integer()),
                        Column('updated_date', t.DATETIME()),
                        Column('deleted_by', t.Integer()),
                        Column('deleted_date', t.DATETIME()),
                        Column('deleted', t.Boolean(), default=False),
                        schema=xSch)

class XrayEEG(object):pass
xray_eeg_tb = Table('sr_eeg', meta,
                        Column('id', t.Integer(),
                               sa.Sequence('sr_xray_eeg_id_seq', optional=True),
                               primary_key=True),
                        Column('pa_id', t.Integer(), ForeignKey(mrSch+'.'+'nano_patient.id')),
                        Column('vn_id', t.Integer(), ForeignKey(mrSch+'.'+'nano_visit.id')),
                        Column('order_id', t.Integer(), ForeignKey(mSch+'.'+'neural_order.id')),
                        Column('eeg_date', t.DATETIME()),
                        Column('eeg_no', t.String(40)),
                        Column('symptom', t.Text()),
                        Column('diag', t.Text()),
                        Column('result', t.Text()),
                        Column('remark', t.String(200)),
                        Column('doctor_send', t.String(200)),
                        Column('doctor_read', t.String(200)),
                        Column('is_done', t.Boolean(), default=False),
                        Column('done_date', t.DATETIME()),
                        Column('updated_by', t.Integer()),
                        Column('updated_date', t.DATETIME()),
                        Column('deleted_by', t.Integer()),
                        Column('deleted_date', t.DATETIME()),
                        Column('deleted', t.Boolean(), default=False),
                        schema=xSch)

class XrayEKG(object):pass
xray_ekg_tb = Table('sr_ekg', meta,
                        Column('id', t.Integer(),
                               sa.Sequence('sr_xray_ekg_id_seq', optional=True),
                               primary_key=True),
                        Column('pa_id', t.Integer(), ForeignKey(mrSch+'.'+'nano_patient.id')),
                        Column('vn_id', t.Integer(), ForeignKey(mrSch+'.'+'nano_visit.id')),
                        Column('order_id', t.Integer(), ForeignKey(mSch+'.'+'neural_order.id')),
                        Column('ekg_date', t.DATETIME()),
                        Column('ekg_no', t.String(40)),
                        Column('symptom', t.Text()),
                        Column('diag', t.Text()),
                        Column('result', t.Text()),
                        Column('remark', t.String(200)),
                        Column('doctor_send', t.String(200)),
                        Column('doctor_read', t.String(200)),
                        Column('is_done', t.Boolean(), default=False),
                        Column('done_date', t.DATETIME()),
                        Column('updated_by', t.Integer()),
                        Column('updated_date', t.DATETIME()),
                        Column('deleted_by', t.Integer()),
                        Column('deleted_date', t.DATETIME()),
                        Column('deleted', t.Boolean(), default=False),
                        schema=xSch)

class XrayXray(object):pass
xray_xray_tb = Table('sr_xray', meta,
                        Column('id', t.Integer(),
                               sa.Sequence('sr_xray_xray_id_seq', optional=True),
                               primary_key=True),
                        Column('pa_id', t.Integer(), ForeignKey(mrSch+'.'+'nano_patient.id')),
                        Column('vn_id', t.Integer(), ForeignKey(mrSch+'.'+'nano_visit.id')),
                        Column('order_id', t.Integer(), ForeignKey(mSch+'.'+'neural_order.id')),
                        Column('xray_date', t.DATETIME()),
                        Column('xray_no', t.String(40)),
                        Column('film_size', t.String(100)),
                        Column('film_number', t.String(100)),
                        Column('diag', t.String(200)),
                        Column('result', t.String(200)),
                        Column('remark', t.String(200)),
                        Column('doctor_send', t.String(200)),
                        Column('doctor_read', t.String(200)),
                        Column('is_done', t.Boolean(), default=False),
                        Column('done_date', t.DATETIME()),
                        Column('updated_by', t.Integer()),
                        Column('updated_date', t.DATETIME()),
                        Column('deleted_by', t.Integer()),
                        Column('deleted_date', t.DATETIME()),
                        Column('deleted', t.Boolean(), default=False),
                        schema=xSch)

class XrayXrayPart(object):pass
xray_xray_part_tb = Table('sr_xray_part', meta,
                        Column('id', t.Integer(),
                               sa.Sequence('sr_xray_xray_part_id_seq', optional=True),
                               primary_key=True),
                        Column('xray_id', t.Integer(), ForeignKey(xSch+'.'+'sr_xray.id')),
                        Column('part_id', t.Integer(), ForeignKey(xSch+'.'+'sr_part.id')),
                        Column('updated_by', t.Integer()),
                        Column('updated_date', t.DATETIME()),
                        Column('deleted_by', t.Integer()),
                        Column('deleted_date', t.DATETIME()),
                        Column('deleted', t.Boolean(), default=False),
                        schema=xSch)

# --------------------------
# frontmed Section
# --------------------------
class NeuralAppointment(object):
    @staticmethod
    def get_appointment(s, patient_id, com_id):
        return s.query(NeuralAppointment).filter_by(patient_id=patient_id, component_id=com_id)\
                .filter(between(neural_appointment_tb.c.appointment_date,\
                        DateUtil.startOfTheDay(datetime.now()),\
                        DateUtil.endOfTheDay(datetime.now()))).\
                order_by(NeuralAppointment.appointment_date.desc()).first()

neural_appointment_tb = Table('neural_appointment', meta, autoload=True, schema=frSch)

# --------------------------
# med Section
# --------------------------
class NeuralIcd10(object):pass
neural_icd10_tb = Table('neural_icd10', meta, autoload=True, schema=mSch)

class NeuralOrderIcd10(object):pass
neural_order_icd10_tb = Table('neural_order_icd10', meta, autoload=True, schema=mSch)

class NeuralOrder(object):
    @staticmethod
    def make_order(s, visit, user, type, fItem, qty):
        order = NeuralOrder()
        order.order_date = datetime.now()
        order.vn_id = visit.id
        order.pa_id = visit.id_patient
        order.user_id = user.id
        order.order_type = type
        order.stop = True
        s.save_or_update(order)
        item = NeuralOrderItem()
        item.type = type
        item.date_add = datetime.now()
        item.vn_id = visit.id
        item.order = order
        item.item = fItem
        item.unit = fItem.unit
        item.qty = qty
        item.price = fItem.price
        item.user_id = user.id
        s.save_or_update(item)
        record = NeuralRecord()
        record.vn_id = visit.id
        record.qty = qty
        record.price = fItem.price
        record.order_item = item
        record.created_by = user.id
        s.save_or_update(record)
        s.commit()
        s.refresh(order)

    @staticmethod
    def make_deposit(s, visit, deposit, user):
        order = NeuralOrder()
        order.order_date = datetime.now()
        order.vn_id = visit.id
        order.pa_id = visit.id_patient
        order.user_id = user.id
        order.order_type = "deposit"
        order.stop = True
        s.save_or_update(order)
        item = NeuralOrderItem()
        item.type = "deposit"
        item.date_add = datetime.now()
        item.vn_id = visit.id
        item.order = order
        service = Item.get_deposit(s)
        item.item = service
        item.unit = service.unit
        item.qty = 1
        item.price = deposit
        item.user_id = user.id
        s.save_or_update(item)
        record = NeuralRecord()
        record.vn_id = visit.id
        record.qty = item.qty
        record.price = item.price
        record.order_item = item
        record.created_by = user.id
        s.save_or_update(record)
        s.commit()
        s.refresh(order)
        return order.id

    @staticmethod
    def add_ipd_er_charge(s, order):
        item = NeuralOrderItem()
        item.type = "ipder"
        item.date_add = datetime.now()
        item.vn_id = order.vn_id
        item.order = order
        service = Item.get_ipd_er_charge(s)
        item.item = service
        item.unit = service.unit
        item.qty = 1
        item.price = service.price
        item.user_id = order.user_id
        s.save_or_update(item)
        record = NeuralRecord()
        record.vn_id = order.vn_id
        record.qty = item.qty
        record.price = item.price
        record.order_item = item
        record.created_by = order.user_id
        s.save_or_update(record)

    @staticmethod
    def add_ipd_service_charge(s, order):
        item = NeuralOrderItem()
        item.type = "ipdsc"
        item.date_add = datetime.now()
        item.vn_id = order.vn_id
        item.order = order
        service = Item.get_ipd_service_charge(s)
        item.item = service
        item.unit = service.unit
        item.qty = 1
        item.price = service.price
        item.user_id = order.user_id
        s.save_or_update(item)
        record = NeuralRecord()
        record.vn_id = order.vn_id
        record.qty = item.qty
        record.price = item.price
        record.order_item = item
        record.created_by = order.user_id
        s.save_or_update(record)

    @staticmethod
    def add_room_charge(s, order, building, roomSpecial, room_separate, building_id):
        service = Item.get_normal_room(s)
        if building_id == 11:
        	service = Item.get_covid_room(s)
        #if building.isSpecial():
        #    service = Item.get_special_room(s)
        #else:
        #    if roomSpecial:
        #        service = Item.get_cheap_special_room(s)
        #if room_separate:
        #    if building_id == '3':
        #        service = Item.get_cheap_special_room_three(s)
        #    else :
        #        service = Item.get_cheap_special_room_six(s)
        if roomSpecial:
            service = Item.get_cheap_special_room(s)
        else :
            if room_separate:
                if building_id == 3:
                    service = Item.get_cheap_special_room_three(s)
                elif building_id == 6:
                    service = Item.get_cheap_special_room_six(s)


        item = NeuralOrderItem()
        item.type = "room"
        item.date_add = datetime.now()
        item.vn_id = order.vn_id
        item.order = order
        item.item = service
        item.unit = service.unit
        item.qty = 1
        item.price = service.price
        item.user_id = order.user_id
        s.save_or_update(item)
        record = NeuralRecord()
        record.vn_id = order.vn_id
        record.qty = item.qty
        record.price = item.price
        record.order_item = item
        record.created_by = order.user_id
        s.save_or_update(record)

    def add_special_food_charge(self, qty):
        s = orm.object_session(self)
        item = s.query(NeuralOrderItem).filter_by(type='food', order_id=self.id).first()

        if not item:
            item = NeuralOrderItem()
            item.qty = qty
            item.type = "food"
            item.date_add = datetime.now()
            item.vn_id = self.vn_id
            item.order = self
            service = Item.get_special_food(s)
            item.item = service
            item.unit = service.unit
            item.price = service.price
            item.user_id = self.user_id
            s.save_or_update(item)
            record = NeuralRecord()
            record.vn_id = self.vn_id
            record.qty = item.qty
            record.price = item.price
            record.order_item = item
            record.created_by = self.user_id
            s.save_or_update(record)
        else:
            item.qty += qty
            s.save_or_update(item)
            item.records[0].qty += qty
            s.save_or_update(item.records[0])
        s.commit()

    @staticmethod
    def make_room_charge(s, visit, user, building_id, roomSpecial, change, admit_date, room_separate):
        oldorder = s.query(NeuralOrder).filter_by(vn_id=visit.id, order_type=u'room', deleted=False, stop=False).first()
        if(oldorder and not change): return False
        if oldorder:
            if oldorder.order_date.date() == datetime.now().date():
                oldorder.deleted=True
            else:
                NeuralOrder.updateRoomCharge(s, oldorder, False)
            oldorder.stop = True
            s.save_or_update(oldorder)

        visitorder = s.query(NeuralOrder).filter_by(vn_id=visit.id,
                        order_type=u'visit', deleted=False).first()
        if visitorder:
            visitorder.deleted = True
            s.update(visitorder)
        order = NeuralOrder()
        order.order_date = admit_date
        order.vn_id = visit.id
        order.pa_id = visit.id_patient
        order.user_id = user.id
        order.order_type = "room"
        order.stop = False
        s.save_or_update(order)
        building = s.query(Building).get(building_id)
        NeuralOrder.add_ipd_service_charge(s, order)
        NeuralOrder.add_room_charge(s, order, building, roomSpecial, room_separate, building_id)
#        ipder = s.query(NeuralOrderItem).filter_by(deleted=False, type='ipder').join('order').filter_by(deleted=False, vn_id=visit.id).count()
#        if ipder == 0:
#            orderer = NeuralOrder()
#            orderer.order_date = admit_date
#            orderer.vn_id = visit.id
#            orderer.pa_id = visit.id_patient
#            orderer.user_id = user.id
#            orderer.order_type = "ipder"
#            orderer.stop = True
#            s.save_or_update(orderer)
#            NeuralOrder.add_ipd_er_charge(s, orderer)
        s.commit()
        return True

    @staticmethod
    def updateRoomCharge(s, order, discharge):
        ipdmain = s.query(IpdMain).filter_by(an=order.visit.an).first()
        end_date = datetime.now().date()
        if discharge:
            order.stop = True
            s.update(order)
            end_date = ipdmain.dc_date
        days_stay = (end_date - order.order_date.date()).days + 1

        home_visits = s.query(IpdHomeVisit).filter_by(an=order.visit.an, delete=False).all()

        dt = order.order_date.date()
        dvisit = 0
        while(dt <= end_date):
            for hv in home_visits:
                if(hv.hv_date <= dt and dt < hv.hv_back_date):
                    dvisit += 1
                    break
            dt += timedelta(1)

        days_stay -= (dvisit + 1)
        if (days_stay == 0) or (days_stay == -1):
            days_stay += 1

        for oitem in order.order_items:
            if oitem.type != 'food':
                oitem.qty = days_stay
                s.update(oitem)
                oitem.records[0].qty = days_stay
                s.update(oitem.records[0])
            if oitem.item_id == Item.IPD_ER_CHARGE_ID:
                oitem.qty = 1
                s.update(oitem)
                oitem.records[0].qty = 1
                s.update(oitem.records[0])
        s.commit()

    @staticmethod
    def make_service_charge(s, visit, user):
        """check if this visit already has service charge, and if not then add the service charge.
            Return True if new service charge is made."""
        isOvertime = SysHoliday.isOvertime(datetime.today())
        oldorder = s.query(NeuralOrder).filter_by(vn_id=visit.id, order_type=u'visit', deleted=False).count()
        if(oldorder > 0): return False
        order = NeuralOrder()
        order.order_date = datetime.now()
        order.vn_id = visit.id
        order.pa_id = visit.id_patient
        order.user_id = user.id
        order.order_type = "visit"
        order.stop = True
        s.save_or_update(order)
        item = NeuralOrderItem()
        item.type = "visit"
        item.date_add = datetime.now()
        item.vn_id = visit.id
        item.order = order
        patient = s.query(Patient).get(visit.id_patient)
        if patient and patient._is_foreigner():
            service = Item.get_foreigner_service_charge(s)
        else:
            if isOvertime:
                service = Item.get_ot_service_charge(s)
            else:
                service = Item.get_service_charge(s)
        item.item = service
        item.unit = service.unit
        item.qty = 1
        price = service.price
        item.price = price
        item.user_id = user.id
        s.save_or_update(item)
        record = NeuralRecord()
        record.vn_id = visit.id
        record.qty = item.qty
        record.price = price
        record.order_item = item
        record.created_by = user.id
        s.save_or_update(record)
        s.commit()
        return True


neural_order_tb = Table('neural_order', meta, autoload=True, schema=mSch)

class NeuralOrderItem(object):pass
neural_order_item_tb = Table('neural_order_item', meta, autoload=True, schema=mSch)

class NeuralRecord(object):
    @staticmethod
    def records_by_order(order_id, pa_id):
        price_factor = Patient._price_factor(pa_id)
        stmt = select([NeuralOrderItem.item_id, Item.name.label('item_name'), \
                    ItemGroup.name.label('group_name'), \
                    ItemUnit.name.label('unit_name'), \
                    func.ceiling(func.sum(NeuralRecord.qty)).label('qty'), \
                    case([(Item.use_price_factor==True, NeuralRecord.price * price_factor)], else_=NeuralRecord.price)\
                    .label('price'), NeuralOrderItem.frequency, NeuralOrderItem.pertime], \
               #(NeuralOrder.id==order_id) & (NeuralRecord.paid==False) & \
               (NeuralOrder.id==order_id) & (Item.pay==True) & \
               (NeuralRecord.deleted==False) & (NeuralOrderItem.deleted==False), \
               #(NeuralRecord.deleted==False), \
               from_obj=[join(NeuralRecord, NeuralOrderItem, NeuralRecord.order_item_id==NeuralOrderItem.id)\
                         .join(NeuralOrder, NeuralOrderItem.order_id==NeuralOrder.id)\
                         .join(Item, NeuralOrderItem.item_id==Item.id)\
                         .join(ItemGroup, Item.group_id==ItemGroup.id)\
                         .join(ItemUnit, Item.unit_id==ItemUnit.id)])\
                .group_by(NeuralOrderItem.item_id, Item.name, ItemGroup.name, \
                          ItemUnit.name, NeuralRecord.price,NeuralOrderItem.frequency, \
                          NeuralOrderItem.pertime, Item.use_price_factor)
        #return stmt
        rs = stmt.execute()
        result = rs.fetchall()
        rs.close()
        return result

    @staticmethod
    def unpaid_records_by_orders(orders, pa_id):
        price_factor = Patient._price_factor(pa_id)
        stmt = select([NeuralOrderItem.item_id, Item.name.label('item_name'), \
                    NeuralOrderItem.reason, ItemGroup.id.label('group_id'), \
                    ItemGroup.name.label('group_name'), \
                    ItemUnit.id.label('unit_id'), \
                    ItemUnit.name.label('unit_name'), \
                    func.ceiling(func.sum(NeuralRecord.qty)).label('qty'), \
                    case([(Item.use_price_factor==True, NeuralRecord.price * price_factor)], else_=NeuralRecord.price)\
                    .label('price'), NeuralOrderItem.frequency, NeuralOrderItem.pertime], \
               #(NeuralOrder.id==order_id) & (NeuralRecord.paid==False) & \
               #(NeuralOrder.stop==True) & \
               (NeuralOrder.paid==False) & (NeuralOrder.pt_leave==False) & (NeuralOrder.deleted==False) & \
               (NeuralOrder.id.in_(orders)) & (Item.pay==True) & \
               (NeuralRecord.deleted==False) & (NeuralOrderItem.deleted==False), \
               #(NeuralRecord.deleted==False), \
               from_obj=[join(NeuralRecord, NeuralOrderItem, NeuralRecord.order_item_id==NeuralOrderItem.id)\
                         .join(NeuralOrder, NeuralOrderItem.order_id==NeuralOrder.id)\
                         .join(Item, NeuralOrderItem.item_id==Item.id)\
                         .join(ItemGroup, Item.group_id==ItemGroup.id)\
                         .join(ItemUnit, Item.unit_id==ItemUnit.id)])\
                .group_by(NeuralOrderItem.item_id, Item.name, NeuralOrderItem.reason, ItemGroup.name, \
                          ItemUnit.id, ItemUnit.name, NeuralRecord.price,NeuralOrderItem.frequency, \
                          NeuralOrderItem.pertime, ItemGroup.id, Item.use_price_factor).\
                order_by(ItemGroup.name, Item.name)
        rs = stmt.execute()
        result = rs.fetchall()
        rs.close()
        return result

    @staticmethod
    def unpaid_records(pa_id):
        price_factor = Patient._price_factor(pa_id)
        stmt = select([NeuralOrderItem.item_id, Item.name.label('item_name'), \
                    ItemGroup.id.label('group_id'), \
                    ItemGroup.name.label('group_name'), \
                    ItemUnit.id.label('unit_id'), \
                    ItemUnit.name.label('unit_name'), \
                    func.ceiling(func.sum(NeuralRecord.qty)).label('qty'), \
                    case([(Item.use_price_factor==True, NeuralRecord.price * price_factor)], else_=NeuralRecord.price)\
                    .label('price'), NeuralOrderItem.frequency, NeuralOrderItem.pertime], \
               #(NeuralOrder.id==order_id) & (NeuralRecord.paid==False) & \
               (NeuralOrder.stop==True) & (NeuralOrder.paid==False) & (NeuralOrder.deleted==False) & \
               (NeuralOrder.pt_leave==False) & (NeuralOrder.pa_id==pa_id) & (Item.pay==True) &\
               (NeuralRecord.deleted==False) & (NeuralOrderItem.deleted==False), \
               #(NeuralRecord.deleted==False), \
               from_obj=[join(NeuralRecord, NeuralOrderItem, NeuralRecord.order_item_id==NeuralOrderItem.id)\
                         .join(NeuralOrder, NeuralOrderItem.order_id==NeuralOrder.id)\
                         .join(Item, NeuralOrderItem.item_id==Item.id)\
                         .join(ItemGroup, Item.group_id==ItemGroup.id)\
                         .join(ItemUnit, Item.unit_id==ItemUnit.id)])\
                .group_by(NeuralOrderItem.item_id, Item.name, ItemGroup.name, \
                          ItemUnit.id, ItemUnit.name, NeuralRecord.price,NeuralOrderItem.frequency, \
                          NeuralOrderItem.pertime, ItemGroup.id, Item.use_price_factor)
        rs = stmt.execute()
        result = rs.fetchall()
        rs.close()
        return result

neural_record_tb = Table('neural_record', meta, autoload=True, schema=mSch)

# --------------------------
# admit Section
# --------------------------

class Drug(object):pass
drug_tb = Table('nano_drug', meta, autoload=True, schema=dSch)

# --------------------------
# admit Section
# --------------------------
class AdmitMain(object):pass
admit_main_tb = Table('admit_main', meta, autoload=True, schema=aSch)

# --------------------------
# ipd Section
# --------------------------

class Building(object):
    def isSpecial(self):
        if self.building_name.find(u'พิเศษ') != -1:
            return True
        else:
            return False
building_tb = Table('mi_building', meta, autoload=True, schema=iSch)

class IpdMain(object):
    def admitDays(self):
        end_date = datetime.now().date()
        if self.dc_date:
            end_date = self.dc_date
        return (end_date - self.admit_date).days

    def homeVisitDays(self):
        s = orm.object_session(self)
        home_visits = s.query(IpdHomeVisit).filter_by(an=self.an, delete=False).all()
        dt = self.admit_date
        end_date = datetime.now().date()
        if self.dc_date:
            end_date = self.dc_date
        dvisit = 0
        while(dt <= end_date):
            for hv in home_visits:
                if(hv.hv_date <= dt and dt < hv.hv_back_date):
                    dvisit += 1
                    break
            dt += timedelta(1)

        return dvisit

ipd_main_tb = Table('mi_ipd_main', meta, autoload=True, schema=iSch)

class IpdHomeVisit(object):pass
ipd_home_visit_tb = Table('mi_ipd_home_visit', meta, autoload=True, schema=iSch)

class IpdGenDetail(object):pass
ipd_gen_detail_tb = Table('mi_ipd_gen_detail', meta, autoload=True, schema=iSch)

# --------------------------
# Medrec Section
# --------------------------
class HospitalCode(object):pass
nano_hospital_code_tb = Table('nano_hospital_code', meta, autoload=True, schema=mrSch)

class DischargeSelect(object):pass
discharge_select_tb = Table('nano_visit_discharge_select', meta, autoload=True, schema=mrSch)

class DischargeActivity(object):pass
discharge_activity_tb = Table('nano_visit_discharge_activity', meta, autoload=True, schema=mrSch)

class Visit(object):
    def getHomeMedInExp(self):
        s = orm.object_session(self)
        price_factor = Patient._price_factor(self.id_patient)
        stmt = select([NeuralOrderItem.item_id, Item.name.label('item_name'), \
                    ItemGroup.id.label('group_id'), \
                    ItemGroup.name.label('group_name'), \
                    ItemUnit.id.label('unit_id'), \
                    ItemUnit.name.label('unit_name'), \
                    func.ceiling(func.sum(NeuralRecord.qty)).label('qty'), \
                    case([(Item.use_price_factor==True, NeuralRecord.price * price_factor)], else_=NeuralRecord.price)\
                    .label('price'), NeuralOrderItem.frequency, NeuralOrderItem.pertime,
                    func.ceiling(func.sum(NeuralRecord.qty * (case([(Item.use_price_factor==True, NeuralRecord.price * price_factor)], else_=NeuralRecord.price)))).label('totalprice')], \
               #(NeuralOrder.id==order_id) & (NeuralRecord.paid==False) & \
               (NeuralOrder.deleted==False) & (NeuralOrder.pt_leave==False) & \
               (NeuralRecord.deleted==False) & (NeuralOrderItem.deleted==False) & \
               (NeuralOrder.vn_id==self.id) & (Item.pay==True) & (Item.group_id==1) & \
               (NeuralOrder.mode=='homemed'), \
               #(NeuralRecord.deleted==False), \
               from_obj=[join(NeuralRecord, NeuralOrderItem, NeuralRecord.order_item_id==NeuralOrderItem.id)\
                         .join(NeuralOrder, NeuralOrderItem.order_id==NeuralOrder.id)\
                         .join(Item, NeuralOrderItem.item_id==Item.id)\
                         .join(ItemGroup, Item.group_id==ItemGroup.id)\
                         .join(ItemUnit, Item.unit_id==ItemUnit.id)])\
                .group_by(NeuralOrderItem.item_id, Item.name, ItemGroup.name, \
                          ItemUnit.id, ItemUnit.name, ItemGroup.id, Item.use_price_factor, \
                          NeuralRecord.price, NeuralOrderItem.frequency, NeuralOrderItem.pertime) \
                .order_by(ItemGroup.name, Item.name)
        rs = stmt.execute()
        result = rs.fetchall()
        rs.close()
        for o in result:
            o.subsidy_amount = self.privilege.subsidy_amount(s, o.item_id,\
                                o.qty, o.price, o.frequency, \
                                o.pertime)
        return result

    def getHomeMedInExpense(self):
        s = orm.object_session(self)
        price_factor = Patient._price_factor(self.id_patient)
        stmt = select([func.ceiling(func.sum(NeuralRecord.qty * (case([(Item.use_price_factor==True, NeuralRecord.price * price_factor)], else_=NeuralRecord.price)))).label('amount')], \
               #(NeuralOrder.id==order_id) & (NeuralRecord.paid==False) & \
               (NeuralOrder.deleted==False) & (NeuralOrder.pt_leave==False) & \
               (NeuralOrder.vn_id==self.id) & (Item.pay==True) & (Item.group_id==1) & \
               (NeuralOrder.mode=='homemed'), \
               #(NeuralRecord.deleted==False), \
               from_obj=[join(NeuralRecord, NeuralOrderItem, NeuralRecord.order_item_id==NeuralOrderItem.id)\
                         .join(NeuralOrder, NeuralOrderItem.order_id==NeuralOrder.id)\
                         .join(Item, NeuralOrderItem.item_id==Item.id)])
        rs = stmt.execute()
        result = rs.fetchone()
        rs.close()
        result.amount = float(result.amount) if result.amount else 0
        return result

    def getHomeMedOutExp(self):
        s = orm.object_session(self)
        price_factor = Patient._price_factor(self.id_patient)
        stmt = select([NeuralOrderItem.item_id, Item.name.label('item_name'), \
                    ItemGroup.id.label('group_id'), \
                    ItemGroup.name.label('group_name'), \
                    ItemUnit.id.label('unit_id'), \
                    ItemUnit.name.label('unit_name'), \
                    func.ceiling(func.sum(NeuralRecord.qty)).label('qty'), \
                    case([(Item.use_price_factor==True, NeuralRecord.price * price_factor)], else_=NeuralRecord.price)\
                    .label('price'), NeuralOrderItem.frequency, NeuralOrderItem.pertime,
                    func.ceiling(func.sum(NeuralRecord.qty * (case([(Item.use_price_factor==True, NeuralRecord.price * price_factor)], else_=NeuralRecord.price)))).label('totalprice')], \
               #(NeuralOrder.id==order_id) & (NeuralRecord.paid==False) & \
               (NeuralOrder.deleted==False) & (NeuralOrder.pt_leave==False) & \
               (NeuralRecord.deleted==False) & (NeuralOrderItem.deleted==False) & \
               (NeuralOrder.vn_id==self.id) & (Item.pay==True) & (Item.group_id==2) & \
               (NeuralOrder.mode=='homemed'), \
               #(NeuralRecord.deleted==False), \
               from_obj=[join(NeuralRecord, NeuralOrderItem, NeuralRecord.order_item_id==NeuralOrderItem.id)\
                         .join(NeuralOrder, NeuralOrderItem.order_id==NeuralOrder.id)\
                         .join(Item, NeuralOrderItem.item_id==Item.id)\
                         .join(ItemGroup, Item.group_id==ItemGroup.id)\
                         .join(ItemUnit, Item.unit_id==ItemUnit.id)])\
                .group_by(NeuralOrderItem.item_id, Item.name, ItemGroup.name, \
                          ItemUnit.id, ItemUnit.name, ItemGroup.id, Item.use_price_factor, \
                          NeuralRecord.price, NeuralOrderItem.frequency, NeuralOrderItem.pertime) \
                .order_by(ItemGroup.name, Item.name)
        rs = stmt.execute()
        result = rs.fetchall()
        rs.close()
        for o in result:
            o.subsidy_amount = self.privilege.subsidy_amount(s, o.item_id,\
                                o.qty, o.price, o.frequency, \
                                o.pertime)
        return result

    def getHomeMedOutExpense(self):
        s = orm.object_session(self)
        price_factor = Patient._price_factor(self.id_patient)
        stmt = select([func.ceiling(func.sum(NeuralRecord.qty * (case([(Item.use_price_factor==True, NeuralRecord.price * price_factor)], else_=NeuralRecord.price)))).label('amount')], \
               #(NeuralOrder.id==order_id) & (NeuralRecord.paid==False) & \
               (NeuralOrder.deleted==False) & (NeuralOrder.pt_leave==False) & \
               (NeuralOrder.vn_id==self.id) & (Item.pay==True) & (Item.group_id==2) & \
               (NeuralOrder.mode=='homemed'), \
               #(NeuralRecord.deleted==False), \
               from_obj=[join(NeuralRecord, NeuralOrderItem, NeuralRecord.order_item_id==NeuralOrderItem.id)\
                         .join(NeuralOrder, NeuralOrderItem.order_id==NeuralOrder.id)\
                         .join(Item, NeuralOrderItem.item_id==Item.id)])
        rs = stmt.execute()
        result = rs.fetchone()
        rs.close()
        result.amount = float(result.amount) if result.amount else 0
        return result

    def getHospMedInExp(self):
        s = orm.object_session(self)
        price_factor = Patient._price_factor(self.id_patient)
        stmt = select([NeuralOrderItem.item_id, Item.name.label('item_name'), \
                    ItemGroup.id.label('group_id'), \
                    ItemGroup.name.label('group_name'), \
                    ItemUnit.id.label('unit_id'), \
                    ItemUnit.name.label('unit_name'), \
                    func.ceiling(func.sum(NeuralRecord.qty)).label('qty'), \
                    case([(Item.use_price_factor==True, NeuralRecord.price * price_factor)], else_=NeuralRecord.price)\
                    .label('price'), NeuralOrderItem.frequency, NeuralOrderItem.pertime,
                    func.ceiling(func.sum(NeuralRecord.qty * (case([(Item.use_price_factor==True, NeuralRecord.price * price_factor)], else_=NeuralRecord.price)))).label('totalprice')], \
               #(NeuralOrder.id==order_id) & (NeuralRecord.paid==False) & \
               (NeuralOrder.deleted==False) & (NeuralOrder.pt_leave==False) & \
               (NeuralRecord.deleted==False) & (NeuralOrderItem.deleted==False) & \
               (NeuralOrder.vn_id==self.id) & (Item.pay==True) & (Item.group_id==1) & \
               (NeuralOrder.mode!='homemed'), \
               #(NeuralRecord.deleted==False), \
               from_obj=[join(NeuralRecord, NeuralOrderItem, NeuralRecord.order_item_id==NeuralOrderItem.id)\
                         .join(NeuralOrder, NeuralOrderItem.order_id==NeuralOrder.id)\
                         .join(Item, NeuralOrderItem.item_id==Item.id)\
                         .join(ItemGroup, Item.group_id==ItemGroup.id)\
                         .join(ItemUnit, Item.unit_id==ItemUnit.id)])\
                .group_by(NeuralOrderItem.item_id, Item.name, ItemGroup.name, \
                          ItemUnit.id, ItemUnit.name, ItemGroup.id, Item.use_price_factor, \
                          NeuralRecord.price, NeuralOrderItem.frequency, NeuralOrderItem.pertime) \
                .order_by(ItemGroup.name, Item.name)
        rs = stmt.execute()
        result = rs.fetchall()
        rs.close()
        for o in result:
            o.subsidy_amount = self.privilege.subsidy_amount(s, o.item_id,\
                                o.qty, o.price, o.frequency, \
                                o.pertime)
        return result

    def getHospitalMedInExpense(self):
        s = orm.object_session(self)
        price_factor = Patient._price_factor(self.id_patient)
        stmt = select([func.ceiling(func.sum(NeuralRecord.qty * (case([(Item.use_price_factor==True, NeuralRecord.price * price_factor)], else_=NeuralRecord.price)))).label('amount')], \
               #(NeuralOrder.id==order_id) & (NeuralRecord.paid==False) & \
               (NeuralOrder.deleted==False) & (NeuralOrder.pt_leave==False) & \
               (NeuralOrder.vn_id==self.id) & (Item.pay==True) & (Item.group_id==1) & \
               (NeuralOrder.mode!='homemed'), \
               #(NeuralRecord.deleted==False), \
               from_obj=[join(NeuralRecord, NeuralOrderItem, NeuralRecord.order_item_id==NeuralOrderItem.id)\
                         .join(NeuralOrder, NeuralOrderItem.order_id==NeuralOrder.id)\
                         .join(Item, NeuralOrderItem.item_id==Item.id)])
        rs = stmt.execute()
        result = rs.fetchone()
        rs.close()
        result.amount = float(result.amount) if result.amount else 0
        return result

    def getHospMedOutExp(self):
        s = orm.object_session(self)
        price_factor = Patient._price_factor(self.id_patient)
        stmt = select([NeuralOrderItem.item_id, Item.name.label('item_name'), \
                    ItemGroup.id.label('group_id'), \
                    ItemGroup.name.label('group_name'), \
                    ItemUnit.id.label('unit_id'), \
                    ItemUnit.name.label('unit_name'), \
                    func.ceiling(func.sum(NeuralRecord.qty)).label('qty'), \
                    case([(Item.use_price_factor==True, NeuralRecord.price * price_factor)], else_=NeuralRecord.price)\
                    .label('price'), NeuralOrderItem.frequency, NeuralOrderItem.pertime,
                    func.ceiling(func.sum(NeuralRecord.qty * (case([(Item.use_price_factor==True, NeuralRecord.price * price_factor)], else_=NeuralRecord.price)))).label('totalprice')], \
               #(NeuralOrder.id==order_id) & (NeuralRecord.paid==False) & \
               (NeuralOrder.deleted==False) & (NeuralOrder.pt_leave==False) & \
               (NeuralRecord.deleted==False) & (NeuralOrderItem.deleted==False) & \
               (NeuralOrder.vn_id==self.id) & (Item.pay==True) & (Item.group_id==2) & \
               (NeuralOrder.mode!='homemed'), \
               #(NeuralRecord.deleted==False), \
               from_obj=[join(NeuralRecord, NeuralOrderItem, NeuralRecord.order_item_id==NeuralOrderItem.id)\
                         .join(NeuralOrder, NeuralOrderItem.order_id==NeuralOrder.id)\
                         .join(Item, NeuralOrderItem.item_id==Item.id)\
                         .join(ItemGroup, Item.group_id==ItemGroup.id)\
                         .join(ItemUnit, Item.unit_id==ItemUnit.id)])\
                .group_by(NeuralOrderItem.item_id, Item.name, ItemGroup.name, \
                          ItemUnit.id, ItemUnit.name, ItemGroup.id, Item.use_price_factor, \
                          NeuralRecord.price, NeuralOrderItem.frequency, NeuralOrderItem.pertime) \
                .order_by(ItemGroup.name, Item.name)
        rs = stmt.execute()
        result = rs.fetchall()
        rs.close()
        for o in result:
            o.subsidy_amount = self.privilege.subsidy_amount(s, o.item_id,\
                                o.qty, o.price, o.frequency, \
                                o.pertime)
        return result

    def getHospitalMedOutExpense(self):
        s = orm.object_session(self)
        price_factor = Patient._price_factor(self.id_patient)
        stmt = select([func.ceiling(func.sum(NeuralRecord.qty * (case([(Item.use_price_factor==True, NeuralRecord.price * price_factor)], else_=NeuralRecord.price)))).label('amount')], \
               #(NeuralOrder.id==order_id) & (NeuralRecord.paid==False) & \
               (NeuralOrder.deleted==False) & (NeuralOrder.pt_leave==False) & \
               (NeuralOrder.vn_id==self.id) & (Item.pay==True) & (Item.group_id==2) & \
               (NeuralOrder.mode!='homemed'), \
               #(NeuralRecord.deleted==False), \
               from_obj=[join(NeuralRecord, NeuralOrderItem, NeuralRecord.order_item_id==NeuralOrderItem.id)\
                         .join(NeuralOrder, NeuralOrderItem.order_id==NeuralOrder.id)\
                         .join(Item, NeuralOrderItem.item_id==Item.id)])
        rs = stmt.execute()
        result = rs.fetchone()
        rs.close()
        result.amount = float(result.amount) if result.amount else 0
        return result

    #all expenses except drug expense
    def getOtherExpense(self):
        price_factor = Patient._price_factor(self.id_patient)
        stmt = select([NeuralOrderItem.item_id, Item.name.label('item_name'), \
                    ItemGroup.id.label('group_id'), \
                    ItemGroup.name.label('group_name'), \
                    ItemUnit.id.label('unit_id'), \
                    ItemUnit.name.label('unit_name'), \
                    func.ceiling(func.sum(NeuralRecord.qty)).label('qty'), \
                    case([(Item.use_price_factor==True, NeuralRecord.price * price_factor)], else_=NeuralRecord.price)\
                    .label('price'), NeuralOrderItem.frequency, NeuralOrderItem.pertime,
                    func.ceiling(func.sum(NeuralRecord.qty * (case([(Item.use_price_factor==True, NeuralRecord.price * price_factor)], else_=NeuralRecord.price)))).label('totalprice')], \
               #(NeuralOrder.id==order_id) & (NeuralRecord.paid==False) & \
               (NeuralOrder.deleted==False) & (NeuralOrder.pt_leave==False) & \
               (NeuralRecord.deleted==False) & (NeuralOrderItem.deleted==False) & \
               (NeuralOrder.vn_id==self.id) & (Item.pay==True) & \
               (NeuralOrder.order_type != 'drug') & (NeuralOrder.order_type != 'deposit'), \
               #(NeuralRecord.deleted==False), \
               from_obj=[join(NeuralRecord, NeuralOrderItem, NeuralRecord.order_item_id==NeuralOrderItem.id)\
                         .join(NeuralOrder, NeuralOrderItem.order_id==NeuralOrder.id)\
                         .join(Item, NeuralOrderItem.item_id==Item.id)\
                         .join(ItemGroup, Item.group_id==ItemGroup.id)\
                         .join(ItemUnit, Item.unit_id==ItemUnit.id)])\
                .group_by(NeuralOrderItem.item_id, Item.name, ItemGroup.name, \
                          ItemUnit.id, ItemUnit.name, ItemGroup.id, Item.use_price_factor, \
                          NeuralRecord.price, NeuralOrderItem.frequency, NeuralOrderItem.pertime) \
                .order_by(ItemGroup.name, Item.name)
        rs = stmt.execute()
        result = rs.fetchall()
        rs.close()
        return result

    def getDiags(self):
        s = orm.object_session(self)
        order = s.query(NeuralOrder).filter_by(deleted=False, vn_id=self.id, order_type='drug').order_by(NeuralOrder.order_date.desc()).first()
        return order.icd10s
        #stmt = select([NeuralIcd10.code, NeuralIcd10.name], \
        #       (NeuralOrder.deleted==False) & (NeuralOrderIcd10.visit_id==self.id), \
        #       from_obj=[join(NeuralOrderIcd10, NeuralOrder, NeuralOrderIcd10.order_id==NeuralOrder.id)\
        #                 .join(NeuralIcd10, NeuralOrderIcd10.icd10_id==NeuralIcd10.id)])\
        #        .group_by(NeuralIcd10.code, NeuralIcd10.name)\
        #        .order_by(func.min(NeuralOrderIcd10.id))
                #.distinct()
        #rs = stmt.execute()
        #result = rs.fetchall()
        #rs.close()
        #return result
#        return s.query(NeuralOrderIcd10.d).filter_by(visit_id=self.id).join('order').filter_by(deleted=False).all()

    @staticmethod
    def visit_to_bill(privilege_id, province_code, start_date, end_date):
        s = Session()
        query = s.query(Visit).join('receipts').\
            filter_by(privilege_id=privilege_id).\
            filter(between(Visit.time_add,
                        DateUtil.startOfTheDay(start_date),
                        DateUtil.endOfTheDay(end_date))).\
            join(['patient', 'province'])
        if province_code != 'all':
            query = query.filter_by(pro_code=province_code)
        query = query.order_by(func.date(Visit.time_add), Province.pro_detail, Patient.pa_name)
        return query.all()

    def get_med_bill_amount(self):
        s = orm.object_session(self)
        amount = s.query(ReceiptD).join('item').filter(or_(\
            Item.group_id==ItemGroup.MedInId, Item.group_id==ItemGroup.MedOutId)).\
            join(['receipth', 'visit']).filter_by(id=self.id).sum(ReceiptD.subsidy_amount)
        return float(amount) if amount else 0.0

    @staticmethod
    def visit_to_bill_super(privilege_id, province_code, start_date, end_date, patient_type):
        s = Session()
        vbwhere = """v.privilege_id = :pvid """
        if patient_type == "ipd":
            vbwhere += """ and v.an is not null and im.dc_date between :std and :end)"""
        else:
            vbwhere += """ and v.an is null and v.time_add between :std and :end)"""
        if  province_code != 'all':
            vbwhere += """ and hosp.h_changwat=:provcode """

        sql = text("""
        select vb.*, coalesce(med.med, 0.00) as med, coalesce(lab.lab, 0.00) as lab, coalesce(eeg.eeg, 0.00) as eeg, coalesce(other.other, 0.00) as other FROM
        (select v.id, v.time_add, v.refer_hosp, v.refer_hosp_code, v.refer_no, v.vn, p.hn,p.pa_pre_name, p.pa_name, p.pa_lastname, p.pa_birthdate, p.pa_refer, pr.pro_detail, v.prcard_id, p.pa_people_number, p.pa_sex, users.number_licensed,
        array_to_string(array(select code from med.neural_order_icd10 ic left outer join med.neural_order o on ic.order_id=o.id and o.deleted=false where visit_id=v.id group by code order by min(ic.id)), ',') as icd10,
        hosp.h_chwname as ad_province from medrec.nano_visit v
LEFT OUTER JOIN medrec.nano_patient p ON p.id = v.id_patient LEFT OUTER JOIN medrec.std_provincecode pr ON p.chwpart=pr.pro_code LEFT OUTER JOIN ipd.mi_ipd_main im ON v.an=im.an
LEFT OUTER JOIN medrec.nano_hospital_code hosp ON v.refer_hosp_code = hosp.h_code
LEFT OUTER JOIN (SELECT vn_id, user_id FROM med.neural_order WHERE order_type = 'drug' AND deleted = 'f' GROUP BY vn_id, user_id) orders ON v.id = orders.vn_id
LEFT OUTER JOIN jvkk.nano_user users ON orders.user_id = users.id
where (""" + vbwhere + """) vb
LEFT OUTER JOIN
(select sum(rd.subsidy_amount) as med, rh.vn_id from finance.sr_receipt_d rd inner join finance.sr_receipt_h rh ON rd.receipt_h_id = rh.id AND rh.cancelled = false
        INNER JOIN finance.sr_item it ON rd.item_id = it.id AND (it.group_id = :medin OR it.group_id = :medout)
            GROUP BY rh.vn_id) med ON vb.id = med.vn_id
LEFT OUTER JOIN
(select sum(rd.subsidy_amount) as lab, rh.vn_id from finance.sr_receipt_d rd inner join finance.sr_receipt_h rh ON rd.receipt_h_id = rh.id AND rh.cancelled = false
        INNER JOIN finance.sr_item it ON rd.item_id = it.id AND (it.group_id = :lab)
                GROUP BY rh.vn_id) lab ON vb.id = lab.vn_id
LEFT OUTER JOIN
(select sum(rd.subsidy_amount) as eeg, rh.vn_id from finance.sr_receipt_d rd inner join finance.sr_receipt_h rh ON rd.receipt_h_id = rh.id AND rh.cancelled = false
        INNER JOIN finance.sr_item it ON rd.item_id = it.id AND (it.group_id = :eeg)
                GROUP BY rh.vn_id) eeg ON vb.id = eeg.vn_id
LEFT OUTER JOIN
(select sum(rd.subsidy_amount) as other, rh.vn_id from finance.sr_receipt_d rd inner join finance.sr_receipt_h rh ON rd.receipt_h_id = rh.id AND rh.cancelled = false
        INNER JOIN finance.sr_item it ON rd.item_id = it.id AND (it.group_id != :medin AND it.group_id != :medout AND it.group_id != :lab AND it.group_id != :eeg)
                GROUP BY rh.vn_id) other ON vb.id = other.vn_id
WHERE med != 0 or lab != 0 or eeg != 0 or other != 0
ORDER BY date(vb.time_add), vb.pro_detail, vb.pa_name
        """)
        return s.execute(sql, params=dict(std=DateUtil.startOfTheDay(start_date),
                  end=DateUtil.endOfTheDay(end_date), provcode=province_code,
                  pvid=privilege_id, medin=ItemGroup.MedInId,
                  medout=ItemGroup.MedOutId, lab=ItemGroup.LabId,
                  eeg=ItemGroup.EEGId)).fetchall()

    def get_lab_bill_amount(self):
        s = orm.object_session(self)
        amount = s.query(ReceiptD).join('item').filter_by(group_id=ItemGroup.LabId).\
            join(['receipth', 'visit']).filter_by(id=self.id).sum(ReceiptD.subsidy_amount)
        return ceil(amount) if amount else 0.0

    def get_eeg_bill_amount(self):
        s = orm.object_session(self)
        amount = s.query(ReceiptD).join('item').filter_by(group_id=ItemGroup.EEGId).\
            join(['receipth', 'visit']).filter_by(id=self.id).sum(ReceiptD.subsidy_amount)
        return ceil(amount) if amount else 0.0

    def get_other_bill_amount(self):
        s = orm.object_session(self)
        amount = s.query(ReceiptD).join('item').filter(and_(and_(Item.group_id!=ItemGroup.MedInId,
            Item.group_id!=ItemGroup.MedOutId), and_(Item.group_id!=ItemGroup.LabId,
            Item.group_id!=ItemGroup.EEGId))).\
            join(['receipth', 'visit']).filter_by(id=self.id).sum(ReceiptD.subsidy_amount)
        return ceil(amount) if amount else 0.0

    def get_receipts(self):
        s = orm.object_session(self)
        stmt = select([ReceiptH.code, ReceiptH.discount, ReceiptH.receive_amount, ReceiptH.support_amount], \
               (ReceiptH.code!=None) & (ReceiptH.cancelled==False) & \
               (ReceiptH.vn_id==self.id), \
               from_obj=[join(ReceiptH, ReceiptD, ReceiptH.id==ReceiptD.receipt_h_id)]).distinct()
        rs = stmt.execute()
        result = rs.fetchall()
        rs.close()
        return result

    def get_supported_receipts(self):
        s = orm.object_session(self)
        stmt = select([ReceiptH.code, ReceiptH.discount, ReceiptH.receive_amount, ReceiptH.support_amount], \
               (ReceiptH.code==None) & (ReceiptH.cancelled==False) & \
               (ReceiptH.vn_id==self.id) & (ReceiptH.support_amount > 0), \
               from_obj=[join(ReceiptH, ReceiptD, ReceiptH.id==ReceiptD.receipt_h_id)]).distinct()
        rs = stmt.execute()
        result = rs.fetchall()
        rs.close()
        return result


#queue_tb = Table('patient_queue', meta, autoload=True)
visit_tb = Table('nano_visit', meta, autoload=True, schema=mrSch)

class Province(object):
    @staticmethod
    def all(session):
        return session.query(Province).\
            order_by(province_tb.c.pro_detail).all()
province_tb = Table('std_provincecode', meta, autoload=True, schema=mrSch)

class Occupation(object):
    @staticmethod
    def all(session):
        return session.query(Occupation).\
            order_by(occupation_tb.c.name).all()
occupation_tb = Table('occptn', meta, autoload=True, schema=mrSch)

class MarriageStatus(object):
    @staticmethod
    def all(session):
        return session.query(MarriageStatus).filter_by(deleted=False).\
            order_by(marriage_status_tb.c.name).all()
marriage_status_tb = Table('sr_marriage_status', meta, autoload=True, schema=sch)

class Education(object):
    @staticmethod
    def all(session):
        return session.query(Education).\
            order_by(education_tb.c.name).all()
education_tb = Table('nano_educationcode', meta, autoload=True, schema=mrSch)

class Patient(object):
    @staticmethod
    def _price_factor(pa_id):
        s = Session()
        patient = s.query(Patient).get(pa_id)
        if patient and patient._is_foreigner():
            return 2
        else:
            return 1

    def _is_foreigner(self):
        return self.pa_name.find('(F)') != -1 or self.pa_lastname.find('(F)') != -1

    def _get_name(self):
        return stringornone(self.pa_pre_name) + self.pa_name + ' ' + self.pa_lastname

    def get_age(self):
        born = self.pa_birthdate
        if not born:
            return ''
        today = datetime.today()
        year_diff  = today.year - born.year
        month_diff = today.month - born.month
        day_diff   = today.day - born.day
        if (day_diff < 0 or month_diff < 0):
            year_diff -= 1
        return year_diff
    def get_precise_age(self):
        born = self.pa_birthdate
        if not born:
            return ''
        today = datetime.today()
        year_diff  = today.year - born.year
        month_diff = today.month - born.month
        day_diff   = today.day - born.day
        if (day_diff < 0):
            day_diff += calendar.monthrange(today.year, today.month)[1]
            month_diff -= 1
            if (month_diff < 0):
                month_diff += 12
                year_diff -= 1

        if (month_diff < 0):
            month_diff += 12
            year_diff -= 1
        return [year_diff, month_diff, day_diff]

    precise_age = property(get_precise_age)
    age = property(get_age)
    name = property(_get_name)

patient_tb = Table('nano_patient', meta, autoload=True, schema=mrSch)

class PatientAddress(object): pass
address_tb = Table('nano_patient_address', meta, autoload=True, schema=mrSch)


# --------------------------
# jvkk Section
# --------------------------
class SysHoliday(object):
    @staticmethod
    def isOvertime(date):
        datepart = date.date()
        timepart = date.time()
        s = Session()
        hcount = s.query(SysHoliday).filter_by(holiday_date=datepart).count()
        if hcount > 0:
            return True
        else:
            weekday = datepart.weekday()
            for wd in SysHoliday.WEEKENDS:
                if int(wd) == weekday:
                    return True
            stHour = split(SysHoliday.OTS, '.')
            enHour = split(SysHoliday.OTE, '.')
            stTime = time(int(stHour[0]), int(stHour[1]))
            enTime = time(int(enHour[0]), int(enHour[1]))
            if timepart < stTime or timepart > enTime:
                return True
        return False


sys_holiday_tb = Table('sys_holiday', meta, autoload=True, schema=sch)

class PatientQueue(object):
    def take_ownership(self, user_id):
        self.time_receive = datetime.now()
        self.user2 = user_id
#queue_tb = Table('patient_queue', meta, autoload=True)

queue_tb = Table('nano_queue', meta, autoload=True, schema=sch)

class QueueLog(object):
    def copy(self, q, transfer_to, action_to, transfer_time):
        self.an = q.an
        self.vn = q.vn
        self.user1 = q.user1
        self.user2 = q.user2
        self.time_send = q.time_send
        self.time_receive = q.time_receive
        self.action_id = q.action_id
        self.action = q.action
        self.com_id1 = q.com_id1
        self.com1 = q.com1
        self.com_id2 = q.com_id2
        self.com2 = q.com2
        self.vn_id = q.vn_id
        self.date_add = q.date_add
        self.com_id3 = transfer_to.id
        self.com3 = transfer_to.com_name
        self.action_id3 = action_to.id if action_to else None
        self.action3 = action_to.name if action_to else None
        self.time_transfer = transfer_time

        '''self.bed = q.bed
        self.building = q.building'''
queue_log_tb = Table('nano_queue_log', meta, autoload=True, schema=sch)

class UserGroup(object): pass
user_group_tb = Table('neural_user_group', meta, autoload=True, schema=sch)

user_tb = Table('nano_user', meta, autoload=True, schema=sch)
class User(object):
    @staticmethod
    def all(session):
        return session.query(User).filter_by(status='1').\
            order_by(user_tb.c.name).all()

    def _get_fullname(self):
        return stringornone(self.title) + stringornone(self.name) + ' ' + stringornone(self.lastname)

    def waitqueue(self, component_id):
        return orm.object_session(self).query(PatientQueue).join('visit')\
                .filter_by(closed=False).filter(
                and_(queue_tb.c.com_id2==component_id,
                     or_(queue_tb.c.user2 == None,
                         queue_tb.c.user2 == self.id))).order_by(PatientQueue.time_send)
                         #.limit(15)
    def waitqueuefinance(self, station_type):
        if station_type == Station.OPD:
            return orm.object_session(self).query(PatientQueue).filter_by(dental=False, medoption=False).join('visit')\
                .filter_by(closed=False).filter(
                and_(queue_tb.c.an==None,
                     and_(queue_tb.c.com_id2==Component.FinanceId,
                     or_(queue_tb.c.user2 == None,
                         queue_tb.c.user2 == self.id))))\
                .order_by(PatientQueue.time_send)
                #.limit(15)
        elif station_type == Station.IPD:
            return orm.object_session(self).query(PatientQueue).filter(
                and_(queue_tb.c.an!=None,
                     and_(queue_tb.c.com_id2==Component.FinanceId,
                     or_(queue_tb.c.time_receive == None,
                         queue_tb.c.user2 == self.id)))).order_by(PatientQueue.time_send)
                         #.limit(15)
        elif station_type == Station.DENTAL:
            return orm.object_session(self).query(PatientQueue).filter_by(dental=True).join('visit')\
                .filter_by(closed=False).filter(
                and_(queue_tb.c.an==None,
                     and_(queue_tb.c.com_id2==Component.FinanceId,
                     or_(queue_tb.c.user2 == None,
                         queue_tb.c.user2 == self.id))))\
                .order_by(PatientQueue.time_send).all()
        elif station_type == Station.ALTERNATIVE:
            return orm.object_session(self).query(PatientQueue).filter_by(medoption=True).join('visit')\
                .filter_by(closed=False).filter(
                and_(queue_tb.c.an==None,
                     and_(queue_tb.c.com_id2==Component.FinanceId,
                     or_(queue_tb.c.user2 == None,
                         queue_tb.c.user2 == self.id))))\
                .order_by(PatientQueue.time_send).all()
        else:
            return []

    def donequeue_by(self, component_id, **kwargs):
        """Return Done queue of every one in this component.
        Filter can be done by keyword"""
        filters = [donequeue_tb.c.com_id2==component_id]
        if(kwargs.has_key('user_id')): filters.append(donequeue_tb.c.user2 == kwargs['user_id'])
        if(kwargs.has_key('station_id')): filters.append(donequeue_tb.c.station_id == kwargs['station_id'])
        qlimit = kwargs.get('limit', 30)
        return orm.object_session(self).query(DoneQueue).filter(
                and_(between(donequeue_tb.c.transfer_time,
                        DateUtil.startOfTheDay(datetime.now()), DateUtil.endOfTheDay(datetime.now())),
                    and_(*filters)
                )).order_by(DoneQueue.transfer_time.desc()).limit(qlimit).all()
    def my_donequeue(self, component_id):
        return self.donequeue_by(component_id, user_id=self.id)
    def donequeue(self, component_id):
        return self.donequeue_by(component_id)
    def donequeuefinance(self, station_type, station_id):
        if station_type == Station.OPD:
            return self.donequeue_by(Component.FinanceId, station_id=station_id)
        elif station_type == Station.IPD:
            return self.donequeue_by(Component.FinanceId, station_id=station_id)
        else:
            return []

    fullname = property(_get_fullname)

class UserSession(object):
    def editable_page(self, session, comid):
        editable = False
        try:
            users_len = session.query(ComponentPermission).filter(
                and_(ComponentPermission.permcom_user==self.user.id,
                                 ComponentPermission.permcom_com==comid)).count()
            editable = users_len > 0
        except:
            editable = False
        return editable

session_tb = Table('nano_session', meta, autoload=True, schema=sch)

class Component(object):
    @staticmethod
    def sendcoms(session):
        return session.query(Component).filter_by(com_status='1').all()

component_tb = Table('nano_components', meta, autoload=True, schema=sch)

class NeuralAction(object):
    @staticmethod
    def actions_by_com(session, comid):
        return session.query(NeuralAction).filter_by(com_id=comid).all()

neural_action_tb = Table('neural_action', meta, autoload=True, schema=sch)

class NeuralComponentAction(object):
    @staticmethod
    def allowed_actions(session, comid):
        stmt = select([Component.id.label('com_id'), Component.com_name.label('com_name'),\
                       NeuralAction.id.label('action_id'), NeuralAction.name.label('action_name'),\
                    ], \
               (NeuralComponentAction.com_id==comid), \
               from_obj=[join(NeuralComponentAction, NeuralAction, NeuralComponentAction.action_id==NeuralAction.id)\
                         .join(Component, NeuralAction.com_id==Component.id)])\
                .group_by(Component.id, Component.com_name, NeuralAction.id, \
                          NeuralAction.name, NeuralAction.com_id).order_by(NeuralAction.com_id)
        rs = stmt.execute()
        result = rs.fetchall()
        rs.close()
        return result

neural_component_action_tb = Table('neural_component_action', meta, autoload=True, schema=sch)

class Module(object):
    @staticmethod
    def sendmods(session, comid):
        return session.query(ModulePermission).filter_by(permmod_com=comid).all()
module_tb = Table('nano_modules', meta, autoload=True, schema=sch)

class ModulePermission(object): pass
component_module_tb = Table('nano_permmod', meta, autoload=True, schema=sch)

class ComponentPermission(object): pass
component_permission_tb = Table('nano_permcom', meta, autoload=True, schema=sch)

Component.FinanceId = int(config['sr.compid.finance'])
Component.SocialId =int(config['sr.compid.social'])
Component.PsycoId =int(config['sr.compid.psyco'])
Component.ZoneId =int(config['sr.compid.zone'])
Component.PsId =int(config['sr.compid.ps'])
Component.XrayId =int(config['sr.compid.xray'])
Module.SocialBg = int(config['sr.modid.social_bg'])
Module.SocialSc = int(config['sr.modid.social_sc'])

ItemGroup.PsycoTestGroupId = int(config['sr.itemgroup.psycotest'])
ItemGroup.PsycoCureGroupId = int(config['sr.itemgroup.psycocure'])
ItemGroup.PsySmcGroupId = int(config['sr.itemgroup.psysmc'])
ItemGroup.MedInId = int(config['sr.itemgroup.medin'])
ItemGroup.MedOutId = int(config['sr.itemgroup.medout'])
ItemGroup.LabId = int(config['sr.itemgroup.lab'])
ItemGroup.EEGId = int(config['sr.itemgroup.eeg'])
ItemGroup.FreeId = int(config['sr.itemgroup.free'])

Item.SERVICE_CHARGE_ID = int(config['sr.item.servicecharge'])
Item.FOREIGNER_SERVICE_CHARGE_ID = int(config['sr.item.frservicecharge'])
Item.DEPOSIT_ID = int(config['sr.item.deposit'])
Item.IPD_SERVICE_CHARGE_ID = int(config['sr.item.ipdservicecharge'])
Item.NORMAL_ROOM_ID = int(config['sr.item.normalroom'])
Item.COVID_ROOM_ID = int(config['sr.item.covidroom'])
Item.SPECIAL_FOOD_ID = int(config['sr.item.specialfood'])
Item.CHEAP_SPECIAL_ROOM_ID = int(config['sr.item.cheapspecialroom'])
Item.CHEAP_SPECIAL_ROOM_THREE_ID = int(config['sr.item.cheapspecialroomthree'])
Item.CHEAP_SPECIAL_ROOM_SIX_ID = int(config['sr.item.cheapspecialroomsix'])
Item.SPECIAL_ROOM_ID = int(config['sr.item.specialroom'])
Item.IPD_ER_CHARGE_ID = int(config['sr.item.ipdercharge'])
Item.EEG_ID = int(config['sr.item.eeg'])
Item.EKG_ID = int(config['sr.item.ekg'])
Item.XRAY_ID = int(config['sr.item.xray'])
Item.PS_ID = int(config['sr.item.ps'])
Item.OT_CHARGE_ID = int(config['sr.item.otcharge'])

ItemUnit.DEFAULT_ID = int(config['sr.unit.default'])

NeuralOrder.PsycoTestType = 'psycho'
Station.OPD = u'ผู้ป่วยนอก'
Station.IPD = u'ผู้ป่วยใน'
Station.DENTAL = u'ทันตกรรม'
Station.ALTERNATIVE = u'แพทย์ทางเลือก'
PsycoTestResult.TYPE_TEST = 'test'
PsycoTestResult.TYPE_CURE = 'cure'

SysHoliday.OTS = config['sr.ots']
SysHoliday.OTE = config['sr.ote']
SysHoliday.WEEKENDS = split(config['sr.weekends'], ',')

# --------------------------
# utils Section
# --------------------------

class DateUtil(object):
    @staticmethod
    def getMonth(d):
        if d.month == 1:
            return u"มกราคม"
        elif d.month == 2:
            return u"กุมภาพันธ์"
        elif d.month == 3:
            return u"มีนาคม"
        elif d.month == 4:
            return u"เมษายน"
        elif d.month == 5:
            return u"พฤษภาคม"
        elif d.month == 6:
            return u"มิถุนายน"
        elif d.month == 7:
            return u"กรกฎาคม"
        elif d.month == 8:
            return u"สิงหาคม"
        elif d.month == 9:
            return u"กันยายน"
        elif d.month == 10:
            return u"ตุลาคม"
        elif d.month == 11:
            return u"พฤศจิกายน"
        elif d.month == 12:
            return u"ธันวาคม"

    @staticmethod
    def toLongFormatDate(date):
        return u"วันที่ " + str(date.day) + " " + DateUtil.getMonth(date) + u" พ.ศ. " + str(date.year + 543)

    @staticmethod
    def toShortFormatDate(date):
        if date:
            return str(date.day) + "/" + str(date.month) + "/" + str(date.year + 543)
        else:
            return ''

    @staticmethod
    def parseDate(dateStr, toAD):
        arrDate = dateStr.split('/')
        if len(arrDate) < 3:
            return None
        if toAD:
            return date(int(arrDate[2]) - 543, int(arrDate[1]), int(arrDate[0]))
        else:
            return date(int(arrDate[2]), int(arrDate[1]), int(arrDate[0]))

    @staticmethod
    def parseTime(timeStr):
        arrTime = timeStr.split(':')
        if len(arrTime) < 2:
            return None
        return time(int(arrTime[0]), int(arrTime[1]))

    @staticmethod
    def startOfTheDay(d):
        return datetime(d.year, d.month, d.day, 0, 0, 0)

    @staticmethod
    def endOfTheDay(d):
        return datetime(d.year, d.month, d.day, 23, 59, 59)

    @staticmethod
    def calculateAge(born):
        #if not born:
        #    return ''
        #today = datetime.today()
        #birthday = datetime(today.year, born.month, born.day)
        #if birthday > today:
        #    return today.year - born.year - 1
        #else:
        #    return today.year - born.year
        if not born:
            return ''
        today = datetime.today()
        year_diff  = today.year - born.year
        month_diff = today.month - born.month
        day_diff   = today.day - born.day
        if (day_diff < 0 or month_diff < 0):
            year_diff -= 1
        return year_diff

class HTMLUtil(object):

    @staticmethod
    def singleLineAnswer(str):
        if (str):
            return '<span class="answer-space">' + str + '</span>'
        else:
            return '<span class="answer-space"></span>'

    @staticmethod
    def multiLineAnswer(str):
        answer = ''
        if str:
            arr = str.strip().split('\n')
            for s in arr:
                if len(s) > 100:
                    n = ceil(len(s)/100.0)
                    i = 0
                    for i in range(n):
                        answer += '<span class="answer-space full-width">' + s[i*100:(i+1)*100] + '</span><br />'
                else:
                    answer += '<span class="answer-space full-width">' + s + '</span><br />'
        else:
            i = 0
            for i in range(2):
                answer += '<span class="answer-space full-width"></span>'
        return answer
