# --- Authentication & Identity Platform -------------------------------------

# Email and password sign-in and the domains allowed to start OAuth popups. The Google
# provider needs an OAuth client secret that Terraform cannot create, so it is enabled once
# in the Firebase console (Authentication > Sign-in method) and kept out of this state.
resource "google_identity_platform_config" "default" {
  project = var.project_id

  sign_in {
    email {
      enabled           = true
      password_required = true
    }

    phone_number {
      enabled = false
    }
  }

  authorized_domains = sort(distinct(concat(
    [
      "localhost",
      "${var.project_id}.firebaseapp.com",
      "${var.project_id}.web.app",
      trimprefix(google_firebase_app_hosting_backend.app.uri, "https://"),
    ],
    var.extra_authorized_domains,
  )))

  # The blocking functions are deployed by `firebase deploy`, so apply after the first
  # deploy. Their URIs are read from the deployed services (ADR 0012).
  blocking_functions {
    triggers {
      event_type   = "beforeCreate"
      function_uri = data.google_cloudfunctions2_function.restrict_sign_up.service_config[0].uri
    }

    triggers {
      event_type   = "beforeSignIn"
      function_uri = data.google_cloudfunctions2_function.restrict_sign_in.service_config[0].uri
    }
  }

  depends_on = [google_firebase_project.this]
}

data "google_cloudfunctions2_function" "restrict_sign_up" {
  project  = var.project_id
  location = var.blocking_functions_region
  name     = "restrictSignUp"
}

data "google_cloudfunctions2_function" "restrict_sign_in" {
  project  = var.project_id
  location = var.blocking_functions_region
  name     = "restrictSignIn"
}
