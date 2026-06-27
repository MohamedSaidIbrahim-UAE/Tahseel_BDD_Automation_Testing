$paths = @('reports/login-report.json','reports/screens-report.json')
foreach ($path in $paths) {
    if (-not (Test-Path $path)) { continue }
    Write-Output "FILE: $path"
    $json = Get-Content $path -Raw | ConvertFrom-Json
    $undefined = [System.Collections.Generic.HashSet[string]]::new()
    $ambiguous = [System.Collections.Generic.HashSet[string]]::new()
    $failed = @()

    foreach ($feature in $json) {
        foreach ($element in $feature.elements) {
            foreach ($step in $element.steps) {
                $status = $step.result.status
                if ($status -eq 'undefined') { $undefined.Add($step.name) | Out-Null }
                if ($status -eq 'ambiguous') { $ambiguous.Add($step.name) | Out-Null }
                if ($status -eq 'failed') { $failed += [pscustomobject]@{ Feature = $feature.description; Scenario = $element.name; Step = $step.name; Error = $step.result.error_message } }
            }
        }
    }

    Write-Output "UNDEFINED $($undefined.Count)"
    $undefined | Sort-Object | ForEach-Object { Write-Output "  $_" }
    Write-Output "AMBIGUOUS $($ambiguous.Count)"
    $ambiguous | Sort-Object | Select-Object -First 20 | ForEach-Object { Write-Output "  $_" }
    Write-Output "FAILED $($failed.Count)"
    foreach ($entry in $failed | Select-Object -First 10) {
        Write-Output "  Scenario: $($entry.Scenario)"
        Write-Output "  Step: $($entry.Step)"
        Write-Output "  Error: $($entry.Error)"
        Write-Output "  ---"
    }
    Write-Output ""
}
