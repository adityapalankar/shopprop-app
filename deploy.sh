#!/usr/bin/env bash
export AWS_PROFILE=metricrealties
export AWS_REGION=us-east-1
stage_name="beta"
terraform_path="deployment/terraforms"

while test $# -gt 0; do
		case "$1" in
			--profile)
				shift
				AWS_PROFILE=$1
				shift
				;;
			--region)
				shift
				AWS_REGION=$1
				shift
				;;
			--stage)
				shift
				stage_name=$1
				shift
				;;
			--bucket)
				shift
				bucket=$1
				shift
				;;
			--folder_path)
				shift
				folder_path=$1
				shift
				;;
      --cf_distribution)
                  shift
                  DISTRIBUTION=$1
                  shift
                  ;;
              --domain)
                  shift
                  domain=$1
                  shift
                  ;;
              --project)
                  shift
                  project_name=$1
                  shift
                  ;;
              --buildcode)
                  shift
                  buildcode=$1
                  shift
                  ;;
              --acm_domain_name)
                  shift
                  acm_domain_name=$1
                  shift
                  ;;
              --s3_backup_folder_name)
                  shift
                  s3_backup_folder_name=$1
                  shift
                  ;;
			*)
				echo "$1 is not a recognized flag!"
				return 1;
				;;
		esac
done  

set -x
clean=0
 if [ "$*" == "clean" ]; then
 		clean=1
 fi


export AWS_ACCESS_KEY_ID=$(aws --profile $AWS_PROFILE configure get aws_access_key_id)
export AWS_SECRET_ACCESS_KEY=$(aws --profile $AWS_PROFILE configure get aws_secret_access_key)

echo "Note: setting up files to aws keys, hope you ran setup.sh, else other commands to deploy will fail"
echo 'building the code'
rm -rf build
mkdir -p build
# npm i @types/googlemaps@3.39.13 --save-dev
#echo "copy configuration files to src"
#cp "deployment/assets/${stage_name}/configuration.json" src/assets/json/configuration.json
#echo "success: copied configuration files to src"
# echo " started building the folder"
npm install --force && npm run build --$stage_name
echo " completed building the build folder"
domain_to_host="${stage_name}.${project_name}"
hosted_zone_records=("${stage_name}.${project_name}")
if [ "$stage_name" == "prod" ]; then
  hosted_zone_records=("${project_name}")
  domain_to_host=${project_name}
fi

export s3_backup_folder="Terraforms/$stage_name.$s3_backup_folder_name/deploy/terraform.tfstate"
export s3_backup_bucket="metric-realties-infrastructure-and-configurations"
export s3_backup_region="us-east-1"
export bucket_name=$domain_to_host


echo "running terraforms to create/update/refresh resources.."
cd $terraform_path
echo "deleting local tf files"
rm -rf .terraform .terraform.lock.hcl out.tfplan terraform.tfplan
# convert array to serialized list
ARRAY_WITH_QUOTES=()
for ENTRY in "${hosted_zone_records[@]}";
do
  ARRAY_WITH_QUOTES+=( "\"${ENTRY}\"" )
done
TERRAFORM_LIST=$(IFS=,; echo [${ARRAY_WITH_QUOTES[*]}])

now_epoch=$(date +%s)
echo "copying existing state for backup"
aws s3 cp "s3://$s3_backup_bucket/$s3_backup_folder" "s3://$s3_backup_bucket/$s3_backup_folder.$now_epoch" --profile $AWS_PROFILE --region $s3_backup_region
echo "backup copied"

terraform init -backend=true -force-copy -reconfigure \
-input=false \
-backend-config "bucket=$s3_backup_bucket" \
-backend-config "key=$s3_backup_folder" \
-backend-config "region=$s3_backup_region"
terraform plan -var="bucket=$bucket_name" \
  -var="stage=$stage_name" \
  -var="domain=$domain" \
  -var="domain_to_host=$domain_to_host" \
  -var="profile=$AWS_PROFILE" \
  -var="alternate_domains=$TERRAFORM_LIST" \
  -var="region=$AWS_REGION" \
  -var="acm_domain_name=$acm_domain_name"  \
  -var="s3_backup_bucket=$s3_backup_bucket" \
  -var="s3_backup_folder=$s3_backup_folder" \
  -var="s3_backup_region=$s3_backup_region"\
  -out terraform.tfplan -lock=false

terraform apply -lock=false terraform.tfplan
terraform_deployment_status=$?
echo "terraform deployment status is $terraform_deployment_status"
cd ../../
cd build

echo "uploading files to s3"
export builds_bucket_name="$bucket_name"
compulsory_files=( "index.html" )
file_exists=true
for file in "${compulsory_files[@]}"
do
  if [[ -f $file ]]
  then
      continue
  else
      echo "$file  not exists on your filesystem."
      file_exists=false
  fi
done

echo $file_exists
if [ $file_exists == true ];then
  echo "delete existing files"
      aws --profile $AWS_PROFILE s3 rm "s3://${builds_bucket_name}" --recursive
  echo "start uploading files"
      aws --profile $AWS_PROFILE s3 sync . "s3://${builds_bucket_name}"
  echo "success: copied build files to s3"
  aws cloudfront create-invalidation --distribution-id $DISTRIBUTION --paths "/*" /index.html /home --profile=$AWS_PROFILE
  echo "done"
  echo "build files being uploaded to aws as website"

fi
