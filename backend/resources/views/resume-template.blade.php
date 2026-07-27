<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{ $student->user?->name ?? 'Student' }} – Resume</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css">
  
  @php
    $personal = $content['personal'] ?? $content['personalInfo'] ?? [];
    $fullName = $personal['fullName'] ?? $personal['name'] ?? $student->user?->name ?? 'Student Name';
    $title = $personal['professionalTitle'] ?? $personal['role'] ?? 'Professional';
    $email = $personal['email'] ?? $student->user?->email ?? '';
    $phone = $personal['phone'] ?? $personal['mobile'] ?? $student->mobile ?? '';
    $location = $personal['location'] ?? $personal['address'] ?? $student->address ?? '';
    $linkedin = $personal['linkedin'] ?? $student->linkedin ?? '';
    $github = $personal['github'] ?? $student->github ?? '';
    $summary = $content['summary'] ?? $content['professionalSummary'] ?? '';
    
    $settings = $content['settings'] ?? [];
    $templateKey = strtolower($settings['template'] ?? 'modern');
    $accentColor = $settings['accentColor'] ?? ($templateKey === 'executive' ? '#C62828' : ($templateKey === 'professional' ? '#1B5E20' : '#0F4C81'));
  @endphp

  <style>
    @media print {
      .no-print { display: none !important; }
      body { background: white !important; padding: 0 !important; }
      .resume-container { box-shadow: none !important; margin: 0 !important; max-width: 100% !important; border: none !important; }
    }
    body { background-color: #f3f4f6; font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; color: #1f2937; }
    .resume-container { max-width: 850px; margin: 30px auto; background: #ffffff; border-radius: 8px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); overflow: hidden; }
    
    .accent-bg { background-color: {{ $accentColor }}; color: #ffffff; }
    .accent-text { color: {{ $accentColor }}; }
    .accent-border { border-color: {{ $accentColor }}; }

    .section-header { font-size: 1.05rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; margin-top: 20px; margin-bottom: 12px; }
    .skill-badge { background-color: #f3f4f6; color: #1f2937; font-weight: 600; font-size: 0.82rem; padding: 4px 10px; border-radius: 16px; margin-right: 6px; margin-bottom: 6px; display: inline-block; border: 1px solid #e5e7eb; }
  </style>
</head>
<body>
  <!-- Action Bar -->
  <div class="container text-end pt-3 no-print" style="max-width: 850px;">
    <span class="badge bg-dark me-2 text-uppercase px-3 py-2 fw-semibold">Template Style: {{ strtoupper($templateKey) }}</span>
    <button onclick="window.print()" class="btn btn-primary btn-sm rounded-pill px-3 fw-bold">
      <i class="bi bi-printer me-1"></i> Print / Save as PDF
    </button>
  </div>

  <div class="resume-container">
    @if($templateKey === 'executive')
      <!-- EXECUTIVE TEMPLATE LAYOUT -->
      <div class="p-5" style="border-top: 8px solid {{ $accentColor }};">
        <div class="d-flex justify-content-between align-items-start border-bottom pb-4 mb-4">
          <div>
            <h1 class="fw-bold mb-1" style="color: {{ $accentColor }}; font-size: 2.2rem;">{{ $fullName }}</h1>
            <p className="fw-semibold text-dark fs-5 mb-2">{{ $title }}</p>
            <div class="small text-muted d-flex flex-wrap gap-3">
              @if($email) <span><i class="bi bi-envelope me-1"></i>{{ $email }}</span> @endif
              @if($phone) <span><i class="bi bi-telephone me-1"></i>{{ $phone }}</span> @endif
              @if($location) <span><i class="bi bi-geo-alt me-1"></i>{{ $location }}</span> @endif
            </div>
          </div>
          <span class="badge bg-dark px-3 py-2 text-uppercase" style="letter-spacing: 0.05em;">Executive Leader</span>
        </div>

        @if(!empty($summary))
          <div class="mb-4 p-3 rounded-3" style="background: #f8fafc; border-left: 4px solid {{ $accentColor }};">
            <h6 class="fw-bold text-uppercase small accent-text mb-1">Executive Summary</h6>
            <p class="mb-0 text-secondary" style="font-size: 0.95rem; line-height: 1.6;">{{ is_array($summary) ? implode(' ', $summary) : $summary }}</p>
          </div>
        @endif
    @elseif($templateKey === 'professional')
      <!-- PROFESSIONAL CLASSIC TEMPLATE LAYOUT -->
      <div class="p-5">
        <div class="text-center pb-4 mb-4 border-bottom">
          <h1 class="fw-bold mb-1 text-dark" style="font-size: 2.2rem; font-family: Georgia, serif;">{{ $fullName }}</h1>
          <p className="fw-semibold text-uppercase text-muted small mb-2" style={{ letterSpacing: "0.1em" }}>{{ $title }}</p>
          <div className="small text-muted d-flex justify-content-center flex-wrap gap-3">
            @if($email) <span>{{ $email }}</span> @endif
            @if($phone) <span>• {{ $phone }}</span> @endif
            @if($location) <span>• {{ $location }}</span> @endif
            @if($linkedin) <span>• {{ $linkedin }}</span> @endif
          </div>
        </div>

        @if(!empty($summary))
          <div className="mb-4">
            <h6 className="section-header pb-1 border-bottom accent-text accent-border">Professional Profile</h6>
            <p className="text-secondary" style={{ fontSize: "0.95rem", lineHeight: 1.6 }}>{{ is_array($summary) ? implode(' ', $summary) : $summary }}</p>
          </div>
        @endif
    @elseif($templateKey === 'minimal')
      <!-- MINIMAL CLEAN TEMPLATE LAYOUT -->
      <div className="p-5">
        <div className="mb-4">
          <h1 className="fw-light text-dark mb-1" style={{ fontSize: "2.4rem", letterSpacing: "-0.5px" }}>{{ $fullName }}</h1>
          <p className="text-secondary fw-medium fs-6 mb-2">{{ $title }}</p>
          <div className="small text-muted d-flex flex-wrap gap-3 pt-1 border-top">
            @if($email) <span>{{ $email }}</span> @endif
            @if($phone) <span>{{ $phone }}</span> @endif
            @if($location) <span>{{ $location }}</span> @endif
          </div>
        </div>

        @if(!empty($summary))
          <div className="mb-4">
            <h6 className="section-header text-muted small border-bottom pb-1">About</h6>
            <p className="text-secondary" style={{ fontSize: "0.92rem", lineHeight: 1.6 }}>{{ is_array($summary) ? implode(' ', $summary) : $summary }}</p>
          </div>
        @endif
    @else
      <!-- MODERN TEMPLATE LAYOUT (DEFAULT) -->
      <div className="accent-bg p-4 text-white">
        <h1 className="fw-bold mb-1">{{ $fullName }}</h1>
        <p className="fw-medium mb-2 opacity-90 fs-5">{{ $title }}</p>
        <div className="small opacity-80 d-flex flex-wrap gap-3">
          @if($email) <span><i className="bi bi-envelope me-1"></i>{{ $email }}</span> @endif
          @if($phone) <span><i className="bi bi-telephone me-1"></i>{{ $phone }}</span> @endif
          @if($location) <span><i className="bi bi-geo-alt me-1"></i>{{ $location }}</span> @endif
          @if($linkedin) <span><i className="bi bi-linkedin me-1"></i>{{ $linkedin }}</span> @endif
        </div>
      </div>
      <div className="p-4">
        @if(!empty($summary))
          <div className="mb-4">
            <h6 className="section-header accent-text border-bottom pb-1 accent-border">Professional Summary</h6>
            <p className="text-secondary" style={{ fontSize: "0.95rem", lineHeight: 1.6 }}>{{ is_array($summary) ? implode(' ', $summary) : $summary }}</p>
          </div>
        @endif
    @endif

    <!-- EDUCATION SECTION -->
    @php $education = $content['education'] ?? []; @endphp
    @if(!empty($education) && is_array($education))
      <div className="mb-4">
        <h6 className="section-header accent-text border-bottom pb-1 accent-border">Education</h6>
        @foreach($education as $edu)
          <div className="mb-3">
            <div className="d-flex justify-content-between align-items-baseline">
              <strong className="text-dark">{{ $edu['degree'] ?? $edu['course'] ?? 'Degree' }} {{ !empty($edu['specialization']) ? '– ' . $edu['specialization'] : '' }}</strong>
              <span className="badge bg-light text-dark border">{{ $edu['endYear'] ?? $edu['year'] ?? '' }}</span>
            </div>
            <p className="mb-0 small text-muted">{{ $edu['college'] ?? $edu['university'] ?? $student->institute?->name ?? '' }}</p>
            @if(!empty($edu['cgpa']) || !empty($edu['score']))
              <small className="text-success fw-medium">CGPA: {{ $edu['cgpa'] ?? $edu['score'] }}</small>
            @endif
          </div>
        @endforeach
      </div>
    @endif

    <!-- EXPERIENCE SECTION -->
    @php $experience = $content['experience'] ?? []; @endphp
    @if(!empty($experience) && is_array($experience))
      <div className="mb-4">
        <h6 className="section-header accent-text border-bottom pb-1 accent-border">Work Experience</h6>
        @foreach($experience as $exp)
          <div className="mb-3">
            <div className="d-flex justify-content-between align-items-baseline">
              <strong className="text-dark">{{ $exp['designation'] ?? $exp['jobTitle'] ?? $exp['role'] ?? 'Role' }}</strong>
              <span className="badge bg-light text-dark border">{{ $exp['startDate'] ?? '' }} – {{ $exp['endDate'] ?? 'Present' }}</span>
            </div>
            <p className="mb-1 small accent-text fw-semibold">{{ $exp['company'] ?? '' }}</p>
            @if(!empty($exp['responsibilities']) || !empty($exp['description']))
              <p className="small text-secondary mb-0">{{ $exp['responsibilities'] ?? $exp['description'] }}</p>
            @endif
          </div>
        @endforeach
      </div>
    @endif

    <!-- PROJECTS SECTION -->
    @php $projects = $content['projects'] ?? []; @endphp
    @if(!empty($projects) && is_array($projects))
      <div className="mb-4">
        <h6 className="section-header accent-text border-bottom pb-1 accent-border">Projects</h6>
        @foreach($projects as $proj)
          <div className="mb-3">
            <strong className="text-dark d-block">{{ $proj['name'] ?? $proj['title'] ?? 'Project' }}</strong>
            @if(!empty($proj['technologies']) || !empty($proj['techStack']))
              <small className="text-muted d-block mb-1">Technologies: {{ is_array($proj['technologies'] ?? $proj['techStack']) ? implode(', ', $proj['technologies'] ?? $proj['techStack']) : ($proj['technologies'] ?? $proj['techStack']) }}</small>
            @endif
            @if(!empty($proj['description']))
              <p className="small text-secondary mb-0">{{ $proj['description'] }}</p>
            @endif
          </div>
        @endforeach
      </div>
    @endif

    <!-- SKILLS SECTION -->
    @php
      $skills = $content['skills'] ?? [];
      $techSkills = $skills['technical'] ?? [];
      $softSkills = $skills['softSkills'] ?? [];
      $allSkills = is_array($skills) ? (isset($skills[0]) ? $skills : array_merge($techSkills, $softSkills)) : [];
    @endphp
    @if(!empty($allSkills))
      <div className="mb-4">
        <h6 className="section-header accent-text border-bottom pb-1 accent-border">Skills & Competencies</h6>
        <div className="pt-1">
          @foreach($allSkills as $sk)
            @if(is_string($sk))
              <span className="skill-badge">{{ $sk }}</span>
            @elseif(is_array($sk) && isset($sk['name']))
              <span className="skill-badge">{{ $sk['name'] }}</span>
            @endif
          @endforeach
        </div>
      </div>
    @endif

    </div>
  </div>
</body>
</html>
