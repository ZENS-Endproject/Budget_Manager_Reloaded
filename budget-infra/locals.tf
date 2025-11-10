locals {
  # replace'/' mit '-' and convert in minuscules
  safe_branch_name = lower(replace(var.branch_name, "/", "-"))
}
