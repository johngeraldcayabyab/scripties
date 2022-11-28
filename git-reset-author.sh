git filter-branch -f --env-filter "
    GIT_AUTHOR_NAME='Dlareg'
    GIT_AUTHOR_EMAIL='johngeraldcayabyab@gmail.com'
    GIT_COMMITTER_NAME='Dlareg'
    GIT_COMMITTER_EMAIL='johngeraldcayabyab@gmail.com'
  " HEAD
