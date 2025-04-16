bash deploy.sh --profile metricrealties --region "us-east-1"  --stage beta \
--domain "metricrealties.com" --project "mobile.metricrealties.com" \
--buildcode true --s3_backup_folder_name "mr_mobile_web" \
--acm_domain_name "mobile.metricrealties.com" --cf_distribution "E1AQ9BE4AE0H9T"

