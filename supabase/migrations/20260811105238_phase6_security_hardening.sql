revoke execute on function public.create_verification_request(uuid,text,text,text,integer,text,text,text,text,text,date,time,text), public.cancel_own_verification_request(uuid,text), public.confirm_verification_request(uuid), public.assign_verification_inspector(uuid,uuid), public.schedule_verification_inspection(uuid,timestamptz), public.start_verification_inspection(uuid), public.save_inspection_report(uuid,public.inspection_result,text,text,public.condition_rating,public.condition_rating,public.condition_rating,public.condition_rating,public.condition_rating,boolean,boolean), public.submit_inspection_report(uuid), public.finalise_verification(uuid) from anon;
drop policy if exists "Verification requests can be read by participants" on public.verification_requests;
drop policy if exists "Inspection reports can be read by their inspector or admin" on public.inspection_reports;
drop policy if exists "Report images can be created by assigned inspectors or admins" on public.inspection_report_images;
drop policy if exists "Report images can be updated by assigned inspectors or admins" on public.inspection_report_images;
drop policy if exists "Only admins can delete report images" on public.inspection_report_images;
drop policy if exists "Report images can be read by their inspector or admin" on public.inspection_report_images;
