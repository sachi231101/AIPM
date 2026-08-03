<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{ $content['personal']['fullName'] ?? $content['personalInfo']['name'] ?? $student->name ?? 'Student' }} – Resume</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css">
  
  @php
    $personal = $content['personal'] ?? $content['personalInfo'] ?? [];
    $fullName = $personal['fullName'] ?? $personal['name'] ?? $student->name ?? $student->user?->name ?? 'Student Name';
    $title    = $personal['professionalTitle'] ?? $personal['role'] ?? $student->course ?? 'Professional Candidate';
    $email    = $personal['email'] ?? $student->email ?? $student->user?->email ?? '';
    $phone    = $personal['phone'] ?? $personal['mobile'] ?? $student->mobile ?? '';
    $location = $personal['location'] ?? $personal['address'] ?? $student->address ?? '';
    $linkedin = $personal['linkedin'] ?? $student->linkedin ?? '';
    $github   = $personal['github'] ?? $student->github ?? '';
    $portfolio = $personal['portfolio'] ?? $student->portfolio ?? '';
    $summary  = $content['summary'] ?? $content['professionalSummary'] ?? '';
    
    $rawPhoto = $personal['photo'] ?? $student->profile_photo ?? '';
    $photo = '';
    if (!empty($rawPhoto)) {
        $photo = (str_starts_with($rawPhoto, 'http') || str_starts_with($rawPhoto, 'data:'))
            ? $rawPhoto
            : \Illuminate\Support\Facades\Storage::disk('public')->url($rawPhoto);
    }
    $showPhoto = isset($personal['showPhoto']) ? ($personal['showPhoto'] !== false && $personal['showPhoto'] !== 'false' && $personal['showPhoto'] !== 0 && $personal['showPhoto'] !== '0') : !empty($photo);
    if (empty($photo)) {
        $showPhoto = false;
    }
    
    $settings = $content['settings'] ?? [];
    $templateKey = strtolower($settings['template'] ?? 'modern');
    $accentColor = $settings['accentColor'] ?? ($templateKey === 'executive' ? '#0F4C81' : ($templateKey === 'professional' ? '#0F4C81' : ($templateKey === 'minimal' ? '#1e293b' : ($templateKey === 'student' ? '#0F4C81' : '#0F4C81'))));

    $education = $content['education'] ?? [];
    $experience = $content['experience'] ?? [];
    $projects = $content['projects'] ?? [];
    $skills = $content['skills'] ?? [];
    $certifications = $content['certifications'] ?? $content['achievements'] ?? [];
    $languages = $content['languages'] ?? [];

    $allSkillsList = [];
    if (is_array($skills)) {
        if (isset($skills[0])) {
            $allSkillsList = $skills;
        } else {
            foreach ($skills as $cat => $list) {
                if (is_array($list)) {
                    foreach ($list as $item) {
                        $allSkillsList[] = is_array($item) ? ($item['name'] ?? '') : $item;
                    }
                } elseif (is_string($list)) {
                    $allSkillsList[] = $list;
                }
            }
        }
    }
    $allSkillsList = array_values(array_filter($allSkillsList));
  @endphp

  <style>
    @page {
      size: A4;
      margin: 8mm 10mm;
    }
    
    @media print {
      .no-print { display: none !important; }
      body { background: #ffffff !important; padding: 0 !important; font-size: 11pt; }
      .resume-wrapper { 
        box-shadow: none !important; 
        margin: 0 !important; 
        max-width: 100% !important; 
        border: none !important; 
        padding: 0 !important;
        background: #ffffff !important;
      }
    }

    body {
      background-color: #f1f5f9;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #1e293b;
      line-height: 1.5;
      -webkit-font-smoothing: antialiased;
    }

    .resume-wrapper {
      max-width: 820px;
      margin: 25px auto;
      background: #ffffff;
      border-radius: 4px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      border: 1px solid #cbd5e1;
      overflow: hidden;
    }

    .skill-badge-tag {
      background-color: #f8fafc;
      color: #0f172a;
      font-weight: 600;
      font-size: 0.8rem;
      padding: 3px 10px;
      border-radius: 4px;
      display: inline-block;
      border: 1px solid #cbd5e1;
      margin-right: 5px;
      margin-bottom: 5px;
    }
  </style>
</head>
<body>

  <!-- Print Toolbar -->
  <div class="container text-end pt-3 no-print" style="max-width: 820px;">
    <div class="d-flex justify-content-between align-items-center bg-white p-2.5 px-3 rounded shadow-sm border mb-3">
      <span class="small fw-semibold text-muted">
        <i class="bi bi-file-earmark-person me-1 text-primary"></i> Live Template: <strong class="text-dark text-uppercase">{{ $templateKey }}</strong>
      </span>
      <button onclick="window.print()" class="btn btn-primary btn-sm px-3 fw-bold">
        <i class="bi bi-printer me-1"></i> Print / Download PDF
      </button>
    </div>
  </div>

  <div class="resume-wrapper">

    @if($templateKey === 'professional')
      <!-- ════════════════ PROFESSIONAL TEMPLATE (MATCHES ProfessionalTemplate.jsx) ════════════════ -->
      <div class="p-4 p-md-5 bg-white text-dark" style="font-size: 0.9rem; line-height: 1.5;">
        <!-- Header Banner -->
        <div class="text-center pb-4 mb-4 border-bottom border-2" style="border-color: {{ $accentColor }} !important;">
          @if($showPhoto && $photo)
            <div class="mb-3">
              <img src="{{ $photo }}" alt="{{ $fullName }}" class="rounded-circle object-fit-cover shadow-sm" style="width: 85px; height: 85px; border: 2px solid {{ $accentColor }};">
            </div>
          @endif
          <h1 class="fw-bold mb-1" style="color: {{ $accentColor }}; font-size: 2rem;">
            {{ $fullName }}
          </h1>
          <div class="fw-medium text-dark fs-6 mb-2">{{ $title }}</div>
          <div class="d-flex flex-wrap justify-content-center gap-3 small text-muted">
            @if($email) <span><i class="bi bi-envelope me-1"></i>{{ $email }}</span> @endif
            @if($phone) <span><i class="bi bi-telephone me-1"></i>{{ $phone }}</span> @endif
            @if($location) <span><i class="bi bi-geo-alt me-1"></i>{{ $location }}</span> @endif
            @if($linkedin) <span><i class="bi bi-linkedin me-1"></i>LinkedIn</span> @endif
            @if($github) <span><i class="bi bi-github me-1"></i>GitHub</span> @endif
          </div>
        </div>

        <!-- Executive Summary -->
        @if(!empty($summary))
          <div class="mb-4">
            <h6 class="fw-bold text-uppercase border-bottom pb-1 mb-2" style="color: {{ $accentColor }}; border-color: #cbd5e1 !important; letter-spacing: 0.5px;">
              Executive Summary
            </h6>
            <p class="text-secondary mb-0">{{ is_array($summary) ? implode(' ', $summary) : $summary }}</p>
          </div>
        @endif

        <!-- Professional Experience -->
        @if(!empty($experience))
          <div class="mb-4">
            <h6 class="fw-bold text-uppercase border-bottom pb-1 mb-2" style="color: {{ $accentColor }}; border-color: #cbd5e1 !important; letter-spacing: 0.5px;">
              Professional Experience
            </h6>
            @foreach($experience as $exp)
              <div class="mb-3">
                <div class="d-flex justify-content-between align-items-baseline">
                  <span class="fw-bold text-dark">{{ $exp['designation'] ?? $exp['jobTitle'] ?? $exp['role'] ?? '' }} — <span class="fst-italic">{{ $exp['company'] ?? '' }}</span></span>
                  <span class="small text-muted fw-semibold">{{ $exp['startDate'] ?? '' }} to {{ !empty($exp['currentCompany']) ? 'Present' : ($exp['endDate'] ?? 'Present') }}</span>
                </div>
                <div class="small text-muted mb-1">{{ $exp['location'] ?? '' }} {{ !empty($exp['employmentType']) ? '| ' . $exp['employmentType'] : '' }}</div>
                @if(!empty($exp['responsibilities']) || !empty($exp['description']))
                  <p class="text-secondary small mb-1">{{ $exp['responsibilities'] ?? $exp['description'] }}</p>
                @endif
                @if(!empty($exp['technologies']))
                  <p class="small text-muted mb-0"><strong>Skills Utilized:</strong> {{ $exp['technologies'] }}</p>
                @endif
              </div>
            @endforeach
          </div>
        @endif

        <!-- Technical Projects -->
        @if(!empty($projects))
          <div class="mb-4">
            <h6 class="fw-bold text-uppercase border-bottom pb-1 mb-2" style="color: {{ $accentColor }}; border-color: #cbd5e1 !important; letter-spacing: 0.5px;">
              Technical Projects
            </h6>
            @foreach($projects as $proj)
              <div class="mb-3">
                <div class="d-flex justify-content-between">
                  <span class="fw-bold text-dark">{{ $proj['name'] ?? $proj['title'] ?? '' }} {{ !empty($proj['role']) ? '(' . $proj['role'] . ')' : '' }}</span>
                  <span class="small text-muted">{{ $proj['duration'] ?? '' }}</span>
                </div>
                @if(!empty($proj['description']))
                  <p class="text-secondary small mb-1">{{ $proj['description'] }}</p>
                @endif
                @if(!empty($proj['responsibilities']))
                  <p class="text-secondary small mb-1">Key Deliverables: {{ $proj['responsibilities'] }}</p>
                @endif
              </div>
            @endforeach
          </div>
        @endif

        <!-- Education & Skills Grid -->
        <div class="row g-4 mb-4">
          <div class="col-md-6">
            <h6 class="fw-bold text-uppercase border-bottom pb-1 mb-2" style="color: {{ $accentColor }}; border-color: #cbd5e1 !important; letter-spacing: 0.5px;">
              Education
            </h6>
            @foreach($education as $edu)
              <div class="mb-2">
                <div class="fw-bold text-dark">{{ $edu['degree'] ?? $edu['course'] ?? '' }} {{ !empty($edu['specialization']) ? 'in ' . $edu['specialization'] : '' }}</div>
                <div class="small text-muted">{{ $edu['college'] ?? $edu['university'] ?? $student->institute?->name ?? '' }} ({{ $edu['startYear'] ?? '' }} – {{ $edu['endYear'] ?? $edu['passingYear'] ?? '' }})</div>
                @if(!empty($edu['cgpa']) || !empty($edu['score']))
                  <div class="small text-muted">CGPA: {{ $edu['cgpa'] ?? $edu['score'] }}</div>
                @endif
              </div>
            @endforeach
          </div>

          <div class="col-md-6">
            <h6 class="fw-bold text-uppercase border-bottom pb-1 mb-2" style="color: {{ $accentColor }}; border-color: #cbd5e1 !important; letter-spacing: 0.5px;">
              Technical Core Competencies
            </h6>
            <p class="small text-secondary">{{ implode(' • ', $allSkillsList) }}</p>
          </div>
        </div>
      </div>

    @elseif($templateKey === 'executive')
      <!-- ════════════════ EXECUTIVE TEMPLATE (MATCHES ExecutiveTemplate.jsx) ════════════════ -->
      <div class="d-flex flex-column flex-md-row min-vh-100">
        <!-- Left Sidebar Column -->
        <div class="p-4 text-white" style="width: 32%; min-width: 250px; background-color: {{ $accentColor }};">
          @if($showPhoto && $photo)
            <div class="text-center mb-4">
              <img src="{{ $photo }}" alt="{{ $fullName }}" class="rounded-circle border border-3 border-white object-fit-cover shadow" style="width: 110px; height: 110px;">
            </div>
          @endif
          <div class="mb-4">
            <h6 class="fw-bold text-uppercase border-bottom border-light border-opacity-25 pb-1 mb-3 text-warning">Contact Info</h6>
            <div class="d-flex flex-column gap-2 small opacity-90">
              @if($email) <div><i class="bi bi-envelope me-2 text-warning"></i>{{ $email }}</div> @endif
              @if($phone) <div><i class="bi bi-telephone me-2 text-warning"></i>{{ $phone }}</div> @endif
              @if($location) <div><i class="bi bi-geo-alt me-2 text-warning"></i>{{ $location }}</div> @endif
              @if($linkedin) <div><i class="bi bi-linkedin me-2 text-warning"></i>LinkedIn</div> @endif
              @if($github) <div><i class="bi bi-github me-2 text-warning"></i>GitHub</div> @endif
            </div>
          </div>

          @if(!empty($allSkillsList))
            <div class="mb-4">
              <h6 class="fw-bold text-uppercase border-bottom border-light border-opacity-25 pb-1 mb-3 text-warning">Core Skills</h6>
              <div class="d-flex flex-wrap gap-1">
                @foreach($allSkillsList as $sk)
                  <span class="badge bg-white text-dark fw-semibold p-1 px-2 mb-1">{{ is_string($sk) ? $sk : ($sk['name'] ?? '') }}</span>
                @endforeach
              </div>
            </div>
          @endif
        </div>

        <!-- Right Main Content -->
        <div class="p-4 p-md-5 flex-grow-1 bg-white">
          <div class="border-bottom pb-3 mb-4">
            <h2 class="fw-bold text-dark mb-1" style="font-size: 1.85rem;">{{ $fullName }}</h2>
            <h6 class="fw-semibold" style="color: {{ $accentColor }};">{{ $title }}</h6>
          </div>

          @if(!empty($summary))
            <div class="mb-4">
              <h6 class="fw-bold text-uppercase mb-2" style="color: {{ $accentColor }};">Profile Summary</h6>
              <p class="text-secondary small mb-0">{{ is_array($summary) ? implode(' ', $summary) : $summary }}</p>
            </div>
          @endif

          @if(!empty($experience))
            <div class="mb-4">
              <h6 class="fw-bold text-uppercase mb-3" style="color: {{ $accentColor }};">Experience</h6>
              @foreach($experience as $exp)
                <div class="mb-3">
                  <div class="d-flex justify-content-between">
                    <strong class="text-dark">{{ $exp['designation'] ?? $exp['jobTitle'] ?? $exp['role'] ?? '' }}</strong>
                    <span class="text-muted small">{{ $exp['startDate'] ?? '' }} – {{ $exp['endDate'] ?? 'Present' }}</span>
                  </div>
                  <div class="small text-muted mb-1">{{ $exp['company'] ?? '' }} | {{ $exp['location'] ?? '' }}</div>
                  <p class="text-secondary small mb-0">{{ $exp['responsibilities'] ?? $exp['description'] ?? '' }}</p>
                </div>
              @endforeach
            </div>
          @endif

          @if(!empty($education))
            <div class="mb-4">
              <h6 class="fw-bold text-uppercase mb-3" style="color: {{ $accentColor }};">Education</h6>
              @foreach($education as $edu)
                <div class="mb-2">
                  <div class="d-flex justify-content-between">
                    <strong class="text-dark">{{ $edu['degree'] ?? '' }} {{ !empty($edu['specialization']) ? '– ' . $edu['specialization'] : '' }}</strong>
                    <span class="small text-muted">{{ $edu['endYear'] ?? '' }}</span>
                  </div>
                  <div class="small text-muted">{{ $edu['college'] ?? $student->institute?->name ?? '' }}</div>
                </div>
              @endforeach
            </div>
          @endif
        </div>
      </div>

    @elseif($templateKey === 'minimal')
      <!-- ════════════════ MINIMAL TEMPLATE (MATCHES MinimalTemplate.jsx) ════════════════ -->
      <div class="p-4 p-md-5 bg-white text-dark" style="font-size: 0.875rem; line-height: 1.6;">
        <div class="d-flex align-items-center justify-content-between mb-4">
          <div>
            <h1 class="fw-bold mb-0" style="color: {{ $accentColor }}; font-size: 2.25rem;">{{ $fullName }}</h1>
            <p class="fs-6 text-muted mb-2">{{ $title }}</p>
            <div class="d-flex flex-wrap gap-2 small text-muted">
              @if($email) <span>{{ $email }}</span> @endif
              @if($phone) <span>• {{ $phone }}</span> @endif
              @if($location) <span>• {{ $location }}</span> @endif
            </div>
          </div>
          @if($showPhoto && $photo)
            <img src="{{ $photo }}" alt="{{ $fullName }}" class="rounded-circle object-fit-cover shadow-sm ms-3" style="width: 75px; height: 75px; border: 2px solid {{ $accentColor }};">
          @endif
        </div>

        <hr class="my-4" />

        @if(!empty($summary))
          <div class="mb-4">
            <h6 class="fw-bold text-uppercase text-muted mb-2" style="letter-spacing: 1px; font-size: 0.75rem;">About</h6>
            <p class="text-secondary mb-0">{{ is_array($summary) ? implode(' ', $summary) : $summary }}</p>
          </div>
        @endif

        @if(!empty($experience))
          <div class="mb-4">
            <h6 class="fw-bold text-uppercase text-muted mb-3" style="letter-spacing: 1px; font-size: 0.75rem;">Experience</h6>
            @foreach($experience as $exp)
              <div class="mb-3">
                <div class="d-flex justify-content-between">
                  <strong>{{ $exp['designation'] ?? '' }} <span class="text-muted">at {{ $exp['company'] ?? '' }}</span></strong>
                  <span class="text-muted small">{{ $exp['startDate'] ?? '' }} — {{ $exp['endDate'] ?? 'Present' }}</span>
                </div>
                <p class="text-secondary mb-0 mt-1">{{ $exp['responsibilities'] ?? $exp['description'] ?? '' }}</p>
              </div>
            @endforeach
          </div>
        @endif

        @if(!empty($education))
          <div class="mb-4">
            <h6 class="fw-bold text-uppercase text-muted mb-3" style="letter-spacing: 1px; font-size: 0.75rem;">Education</h6>
            @foreach($education as $edu)
              <div class="d-flex justify-content-between mb-2">
                <div>
                  <strong>{{ $edu['degree'] ?? '' }} {{ !empty($edu['specialization']) ? 'in ' . $edu['specialization'] : '' }}</strong>
                  <div class="text-muted small">{{ $edu['college'] ?? $student->institute?->name ?? '' }}</div>
                </div>
                <span class="text-muted small">{{ $edu['endYear'] ?? '' }}</span>
              </div>
            @endforeach
          </div>
        @endif

        @if(!empty($allSkillsList))
          <div class="mb-4">
            <h6 class="fw-bold text-uppercase text-muted mb-2" style="letter-spacing: 1px; font-size: 0.75rem;">Skills</h6>
            <p class="text-secondary mb-0">{{ implode(', ', $allSkillsList) }}</p>
          </div>
        @endif
      </div>

    @elseif($templateKey === 'student')
      <!-- ════════════════ STUDENT TEMPLATE (MATCHES StudentTemplate.jsx) ════════════════ -->
      <div class="p-4 p-md-5 bg-white text-dark" style="font-size: 0.9rem; line-height: 1.5;">
        <div class="text-center pb-3 mb-4 border-bottom border-2" style="border-color: {{ $accentColor }} !important;">
          @if($showPhoto && $photo)
            <div class="mb-3">
              <img src="{{ $photo }}" alt="{{ $fullName }}" class="rounded-circle object-fit-cover shadow-sm" style="width: 80px; height: 80px; border: 2px solid {{ $accentColor }};">
            </div>
          @endif
          <h2 class="fw-bold text-uppercase mb-1" style="color: {{ $accentColor }}; font-size: 1.85rem;">{{ $fullName }}</h2>
          <div class="fw-medium text-secondary mb-2">{{ $title }}</div>
          <div class="d-flex flex-wrap justify-content-center gap-3 small text-muted">
            @if($email) <span><i class="bi bi-envelope me-1"></i>{{ $email }}</span> @endif
            @if($phone) <span><i class="bi bi-telephone me-1"></i>{{ $phone }}</span> @endif
            @if($location) <span><i class="bi bi-geo-alt me-1"></i>{{ $location }}</span> @endif
          </div>
        </div>

        @if(!empty($summary))
          <div class="mb-4">
            <h6 class="fw-bold text-uppercase border-bottom pb-1 mb-2" style="color: {{ $accentColor }}; border-color: #cbd5e1 !important;">Career Objective / Summary</h6>
            <p class="text-secondary mb-0">{{ is_array($summary) ? implode(' ', $summary) : $summary }}</p>
          </div>
        @endif

        @if(!empty($education))
          <div class="mb-4">
            <h6 class="fw-bold text-uppercase border-bottom pb-1 mb-2" style="color: {{ $accentColor }}; border-color: #cbd5e1 !important;">Education & Academic Credentials</h6>
            @foreach($education as $edu)
              <div class="mb-2 d-flex justify-content-between">
                <div>
                  <span class="fw-bold text-dark">{{ $edu['degree'] ?? '' }} — {{ $edu['specialization'] ?? '' }}</span>
                  <div class="small text-muted">{{ $edu['college'] ?? $student->institute?->name ?? '' }}</div>
                </div>
                <div class="text-end small">
                  <span class="fw-semibold">{{ $edu['endYear'] ?? '' }}</span>
                  @if(!empty($edu['cgpa'])) <div class="text-muted">CGPA: <strong>{{ $edu['cgpa'] }}</strong></div> @endif
                </div>
              </div>
            @endforeach
          </div>
        @endif

        @if(!empty($allSkillsList))
          <div class="mb-4">
            <h6 class="fw-bold text-uppercase border-bottom pb-1 mb-2" style="color: {{ $accentColor }}; border-color: #cbd5e1 !important;">Technical & Professional Skills</h6>
            <div class="pt-1">
              @foreach($allSkillsList as $sk)
                <span class="skill-badge-tag">{{ is_string($sk) ? $sk : ($sk['name'] ?? '') }}</span>
              @endforeach
            </div>
          </div>
        @endif
      </div>

    @else
      <!-- ════════════════ MODERN TEMPLATE (MATCHES ModernTemplate.jsx) ════════════════ -->
      <div class="p-4 p-md-5 bg-white text-dark" style="font-size: 0.9rem; line-height: 1.5;">
        <div class="d-flex align-items-center justify-content-between border-bottom pb-4 mb-4" style="border-bottom: 2px solid {{ $accentColor }} !important;">
          <div class="d-flex align-items-center gap-3">
            @if($showPhoto && $photo)
              <img src="{{ $photo }}" alt="{{ $fullName }}" class="rounded-circle object-fit-cover shadow-sm" style="width: 72px; height: 72px; border: 2px solid {{ $accentColor }};">
            @endif
            <div>
              <h2 class="fw-bold mb-1 text-uppercase" style="color: {{ $accentColor }}; font-size: 1.75rem;">{{ $fullName }}</h2>
              <p class="fw-semibold text-secondary mb-1 fs-6">{{ $title }}</p>
              <p class="text-muted small mb-0">{{ $location }}</p>
            </div>
          </div>
          <div class="text-end small text-muted">
            @if($email) <div><i class="bi bi-envelope-fill me-1" style="color: {{ $accentColor }};"></i>{{ $email }}</div> @endif
            @if($phone) <div><i class="bi bi-telephone-fill me-1" style="color: {{ $accentColor }};"></i>{{ $phone }}</div> @endif
            @if($linkedin) <div><i class="bi bi-linkedin me-1" style="color: {{ $accentColor }};"></i>LinkedIn</div> @endif
          </div>
        </div>

        @if(!empty($summary))
          <div class="mb-4">
            <h6 class="fw-bold text-uppercase border-bottom pb-1 mb-2" style="color: {{ $accentColor }}; border-color: #e2e8f0 !important;">Professional Summary</h6>
            <p class="text-secondary mb-0">{{ is_array($summary) ? implode(' ', $summary) : $summary }}</p>
          </div>
        @endif

        @if(!empty($experience))
          <div class="mb-4">
            <h6 class="fw-bold text-uppercase border-bottom pb-1 mb-2" style="color: {{ $accentColor }}; border-color: #e2e8f0 !important;">Experience & Internships</h6>
            @foreach($experience as $exp)
              <div class="mb-3">
                <div class="d-flex justify-content-between align-items-baseline">
                  <span class="fw-bold text-dark fs-6">{{ $exp['designation'] ?? '' }} <span class="fw-normal text-muted">| {{ $exp['company'] ?? '' }}</span></span>
                  <span class="small text-muted fw-medium">{{ $exp['startDate'] ?? '' }} – {{ $exp['endDate'] ?? 'Present' }}</span>
                </div>
                @if(!empty($exp['responsibilities'])) <p class="text-secondary small mb-1">{{ $exp['responsibilities'] }}</p> @endif
              </div>
            @endforeach
          </div>
        @endif

        @if(!empty($education))
          <div class="mb-4">
            <h6 class="fw-bold text-uppercase border-bottom pb-1 mb-2" style="color: {{ $accentColor }}; border-color: #e2e8f0 !important;">Education</h6>
            @foreach($education as $edu)
              <div class="mb-2 d-flex justify-content-between align-items-baseline">
                <div>
                  <strong class="text-dark">{{ $edu['degree'] ?? '' }} {{ !empty($edu['specialization']) ? '– ' . $edu['specialization'] : '' }}</strong>
                  <div class="small text-muted">{{ $edu['college'] ?? $student->institute?->name ?? '' }}</div>
                </div>
                <span class="small text-muted fw-semibold">{{ $edu['endYear'] ?? '' }}</span>
              </div>
            @endforeach
          </div>
        @endif

        @if(!empty($allSkillsList))
          <div>
            <h6 class="fw-bold text-uppercase border-bottom pb-1 mb-2" style="color: {{ $accentColor }}; border-color: #e2e8f0 !important;">Skills</h6>
            <div class="pt-1">
              @foreach($allSkillsList as $sk)
                <span class="skill-badge-tag">{{ is_string($sk) ? $sk : ($sk['name'] ?? '') }}</span>
              @endforeach
            </div>
          </div>
        @endif
      </div>
    @endif

  </div>

</body>
</html>
