#!/bin/bash

# Store the command line arguments in an array
tenant_list=("$@")

# taking backup of original config
dir_name="back_up"

# Create the directory if it doesn't already exist
if [ ! -d "$dir_name" ]; then
  mkdir "$dir_name"
fi

echo "Entering into script"

# Get the path of the script
script_path="$(dirname "$0")"
app_routing_file_name="$script_path/src/app/app-routing.module.ts"
echo "$app_routing_file_name"
capacitor_file_name="capacitor.config.ts"

cp "$capacitor_file_name" "$dir_name/" || { echo "Error: Failed to copy $capacitor_file_name to $dir_name"; exit 1; }
cp "$app_routing_file_name" "$dir_name/" || { echo "Error: Failed to copy $app_routing_file_name to $dir_name"; exit 1; }

app_routing_template="$script_path/tenants/{tenant_name}/app-routing.module.ts"
capacitor_file_template="$script_path/tenants/{tenant_name}/capacitor.config.ts"

android_apk_dir_template="$script_path/tenants/{tenant_name}/android_apks"

ios_app_dir_template="$script_path/tenants/{tenant_name}/ios_apps"

assets_template="$script_path/tenants/{tenant_name}/assets/"


# Loop over each string in the array and print it
for tenant_name in "${tenant_list[@]}"
do
    echo "$tenant_name"
    temp="$tenant_name"
    capacitor_file_path=$(echo "$capacitor_file_template" | sed "s/{tenant_name}/$temp/g") || { echo "Error: Failed to replace template string in $capacitor_file_template"; exit 1; }
    app_routing_file_path=$(echo "$app_routing_template" | sed "s/{tenant_name}/$temp/g") || { echo "Error: Failed to replace template string in $app_routing_template"; exit 1; }
    assets_path=$(echo "$assets_template" | sed "s/{tenant_name}/$temp/g") || { echo "Error: Failed to replace template string in $assets_template"; exit 1; }
    echo "$capacitor_file_path"
    echo "$app_routing_file_path"
    echo "$assets_path"
    cp "$app_routing_file_path" "$app_routing_file_name" || { echo "Error: Failed to copy $app_routing_file_path to $app_routing_file_name"; exit 1; }
    cp "$capacitor_file_path" "$capacitor_file_name" || { echo "Error: Failed to copy $capacitor_file_path to $capacitor_file_name"; exit 1; }
    cp -r "$assets_path" "$script_path/assets/"

    android_apk_dir=$(echo "$android_apk_dir_template" | sed "s/{tenant_name}/$temp/g") || { echo "Error: Failed to replace template string in $android_apk_dir_template"; exit 1; }
    ios_app_dir=$(echo "$ios_app_dir_template" | sed "s/{tenant_name}/$temp/g") || { echo "Error: Failed to replace template string in $ios_app_dir_template"; exit 1; }

    ## creating/cleaning directories for copying the android app
    if [ ! -d "$android_apk_dir" ]; then
      mkdir "$android_apk_dir"
    else
      rm "$android_apk_dir"
    fi

    ## creating/cleaning directories for copying the ios app
    if [ ! -d "$ios_app_dir" ]; then
      mkdir "$ios_app_dir"
    else
      rm "$ios_app_dir"
    fi

    #cleaning up previous android app builds
    rm -rf android
    #creating android app
    npm install @capacitor/cli --legacy-peer-deps
    ng build --prod
    npx cap add android
    npx capacitor-assets generate
    cd android
    ./gradlew assembleRelease
    ./gradlew bundleRelease
    cd ..
    #android sdk needs to be installed
    #add them to class path for build-tools directory EG: /Users/kushalarja/Library/Android/sdk/build-tools/30.0.3/
    apksigner sign --ks src/androidkeystore/metricrealties.jks --ks-pass pass:1234567890 --out android/app/build/outputs/bundle/release/app-signed.aab --min-sdk-version 30 android/app/build/outputs/bundle/release/app-release.aab
    apksigner sign --ks src/androidkeystore/metricrealties.jks --ks-pass pass:1234567890 --out android/app/build/outputs/apk/release/app-release-signed.apk --min-sdk-version 30 android/app/build/outputs/apk/release/app-release-unsigned.apk
    cp android/app/build/outputs/bundle/release/app-signed.aab $android_apk_dir/
    cp android/app/build/outputs/apk/release/app-release-signed.apk $android_apk_dir/

    #npm install @capacitor/assets
    #npx capacitor-assets generate
    #https://www.youtube.com/watch?v=SSv--IrWH3c

done

#reverting the configs
cp "$dir_name/$capacitor_file_name" "$capacitor_file_name"
cp "$dir_name/app-routing.module.ts" "$app_routing_file_name"
rm -rf "$dir_name"
