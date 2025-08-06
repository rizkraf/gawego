-- Update position values for existing applications to maintain order
-- This sets position values based on creation time to preserve existing order

SET @row_number = 0;
SET @prev_status = '';
SET @prev_user = '';

UPDATE `application` a
JOIN (
  SELECT
    id,
    @row_number := CASE
      WHEN @prev_status != status OR @prev_user != user_id THEN 1
      ELSE @row_number + 1
    END AS new_position,
    @prev_status := status,
    @prev_user := user_id
  FROM `application`
  ORDER BY user_id, status, created_at
) ranked ON a.id = ranked.id
SET a.position = ranked.new_position;
