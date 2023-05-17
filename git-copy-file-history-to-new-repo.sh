git log --pretty=email --patch-with-stat --reverse --full-index --binary -m --first-parent -- /file/path/or/directory | (cd /new/path/or/directory && git am --committer-date-is-author-date)
