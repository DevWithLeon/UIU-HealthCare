import re

with open('src/pages/DoctorDashboard.jsx', 'r') as f:
    content = f.read()

# The prescriptions tab is closed around line 1039 with:
#             </div>
#           )}
#         </div>
#       </main>

# Find the start of showPresModal
start_idx = content.find('{/* Create Prescription Modal */}')
if start_idx == -1:
    print("Could not find start of showPresModal")
    exit(1)

# We want to extract everything from start_idx up to the end of selectedPatientForReports
# We can find the closing tags of the tab
end_marker = "            </div>\n          )}\n        </div>\n      </main>"
end_idx = content.find(end_marker)
if end_idx == -1:
    print("Could not find end marker")
    exit(1)

# Extract the modals content
modals_content = content[start_idx:end_idx]

# Remove the modals from inside the tab
new_content = content[:start_idx] + content[end_idx:]

# Now insert the modals right before the closing </div>\n      </main>
# We replace the end_marker with the modals + end_marker
insertion_point = new_content.find("        </div>\n      </main>")
final_content = new_content[:insertion_point] + modals_content + new_content[insertion_point:]

with open('src/pages/DoctorDashboard.jsx', 'w') as f:
    f.write(final_content)

print("Modals moved successfully.")
