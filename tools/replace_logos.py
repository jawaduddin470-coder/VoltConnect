import os
import re

base_path = '/Users/merajuddin/Desktop/Voltconnect-application/voltconnect/lib/screens'

# Map of file path -> import relative path for volt_logo
files_to_update = {
    'driver/map/map_screen.dart': '../../../widgets/volt_logo.dart',
    'driver/trips/trips_screen.dart': '../../../widgets/volt_logo.dart',
    'driver/queue/queue_screen.dart': '../../../widgets/volt_logo.dart',
    'driver/myev/myev_screen.dart': '../../../widgets/volt_logo.dart',
    'driver/calculator/calculator_screen.dart': '../../../widgets/volt_logo.dart',
    'operator/dashboard/dashboard_screen.dart': '../../../widgets/volt_logo.dart',
    'operator/stations/stations_screen.dart': '../../../widgets/volt_logo.dart',
    'operator/add_station/add_station_screen.dart': '../../../widgets/volt_logo.dart',
    'operator/analytics/analytics_screen.dart': '../../../widgets/volt_logo.dart',
    'membership/membership_screen.dart': '../../widgets/volt_logo.dart',
    'community/community_screen.dart': '../../widgets/volt_logo.dart',
}

title_pattern1 = re.compile(
    r"title:\s*Row\(\s*children:\s*\[\s*const\s*Icon\(Icons\.bolt,\s*color:\s*AppColors\.teal,\s*size:\s*20\),\s*const\s*SizedBox\(width:\s*4\),\s*Text\('VoltConnect',\s*style:\s*Theme\.of\(context\)\.textTheme\.titleMedium\?\.copyWith\(color:\s*Colors\.white\)\),\s*\],\s*\),",
    re.MULTILINE
)
title_pattern2 = re.compile(
    r"title:\s*Row\(\s*children:\s*\[\s*const\s*Icon\(Icons\.bolt,\s*color:\s*AppColors\.teal,\s*size:\s*20\),\s*const\s*SizedBox\(width:\s*8\),\s*const\s*Text\('VoltConnect',\s*style:\s*TextStyle\(color:\s*Colors\.white,\s*fontSize:\s*20,\s*fontWeight:\s*FontWeight\.bold\)\),\s*\],\s*\),",
    re.MULTILINE
)
title_pattern3 = re.compile( # Some might have slightly different formatting
    r"title:\s*Row\(\s*children:\s*\[\s*(const\s+)?Icon\(Icons\.bolt.*?\),\s*(const\s+)?SizedBox\(width:\s*\d+\),\s*(const\s+)?Text\('VoltConnect'.*?\),\s*\],\s*\),",
    re.MULTILINE | re.DOTALL
)

for relative_path, import_path in files_to_update.items():
    file_path = os.path.join(base_path, relative_path)
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        continue
        
    with open(file_path, 'r') as f:
        content = f.read()
        
    original = content
        
    replacement = "title: const VoltLogo(size: VoltLogoSize.small),"
    
    # Try multiple patterns
    content, count1 = title_pattern1.subn(replacement, content)
    content, count2 = title_pattern2.subn(replacement, content)
    content, count3 = title_pattern3.subn(replacement, content)
    
    if count1 + count2 + count3 > 0:
        # Need to add import if not already there
        if "volt_logo.dart" not in content:
            # Find last import
            import_matches = list(re.finditer(r"^import\s+['\"].*?['\"];$", content, re.MULTILINE))
            if import_matches:
                last_import = import_matches[-1]
                insert_pos = last_import.end()
                import_stmt = f"\nimport '{import_path}';"
                content = content[:insert_pos] + import_stmt + content[insert_pos:]
        
        with open(file_path, 'w') as f:
            f.write(content)
        print(f"Updated {file_path}")
    else:
        print(f"Could not find title pattern in {file_path}")

# Now update the profile screens
profiles = [
    ('driver/profile/driver_profile_screen.dart', '../../../../widgets/volt_logo.dart'),
    ('operator/profile/operator_profile_screen.dart', '../../../../widgets/volt_logo.dart')
]

for rel_path, imp_path in profiles:
    file_path = os.path.join(base_path, rel_path)
    if not os.path.exists(file_path):
        continue
    with open(file_path, 'r') as f:
        content = f.read()
        
    # We want to insert VoltLogo(size: VoltLogoSize.medium) + SizedBox(height: 24) before the first Stack
    # Look for "child: Column(\n          children: [\n            // Top Section\n            Stack("
    pattern = r"(child:\s*Column\(\s*children:\s*\[\s*)(// Top Section\s*Stack\()"
    
    if "VoltLogo" not in content:
        content, count = re.subn(pattern, r"\1const VoltLogo(size: VoltLogoSize.medium),\n            const SizedBox(height: 24),\n            \2", content)
        if count > 0:
            import_matches = list(re.finditer(r"^import\s+['\"].*?['\"];$", content, re.MULTILINE))
            if import_matches:
                last_import = import_matches[-1]
                insert_pos = last_import.end()
                import_stmt = f"\nimport '{imp_path}';"
                content = content[:insert_pos] + import_stmt + content[insert_pos:]
            with open(file_path, 'w') as f:
                f.write(content)
            print(f"Updated {file_path}")
        else:
            print(f"Pattern not found in {file_path}")
