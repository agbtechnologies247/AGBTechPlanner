# Create a self-signed certificate for MSIX packaging
$publisherName = "CN=AGB Technologies"
$certPath = "scripts\agbtech.pfx"
$password = "agbtech123" | ConvertTo-SecureString -AsPlainText -Force

Write-Host "Creating self-signed certificate for $publisherName..." -ForegroundColor Cyan

$cert = New-SelfSignedCertificate -Type Custom -Subject $publisherName -KeyUsage DigitalSignature -FriendlyName "AGBTech Planner Signing Cert" -CertStoreLocation "Cert:\CurrentUser\My" -TextExtension @("2.5.29.37={text}1.3.6.1.5.5.7.3.3", "2.5.29.19={text}")

Write-Host "Exporting certificate to $certPath..." -ForegroundColor Cyan
Export-PfxCertificate -Cert $cert -FilePath $certPath -Password $password

Write-Host "Certificate created successfully at $certPath" -ForegroundColor Green
Write-Host "IMPORTANT: You must double-click the .pfx file and install it to 'Trusted Root Certification Authorities' on this machine for the MSIX to be installable locally." -ForegroundColor Yellow
